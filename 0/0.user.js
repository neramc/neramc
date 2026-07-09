// ==UserScript==
// @name         YouTube 완전 광고 차단기 (Ultimate)
// @name:en      YouTube Ultimate Adblock
// @version      1.0.0
// @description  유튜브의 모든 광고(프리롤·미드롤·포스트롤 영상광고, 배너/오버레이, 홈·검색·추천 피드 광고, Shorts 광고, 스폰서 프로모션, 프리미엄 업셀)를 다층 구조로 완벽 차단하고 "광고 차단기가 허용되지 않습니다" 팝업까지 우회합니다.
// @description:en Blocks every YouTube ad (video/banner/overlay/feed/Shorts/promoted) and bypasses the anti-adblock wall using a layered defense.
// @author       ChatGPT/Claude assisted
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://music.youtube.com/*
// @match        https://www.youtube-nocookie.com/*
// @match        https://www.youtube.com/embed/*
// @match        https://www.youtube-nocookie.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// @inject-into  page
// @unwrap
// @license      MIT
// ==/UserScript==

/*
 * ─────────────────────────────────────────────────────────────────────────
 *  방어 계층 (Layers of Defense)
 * ─────────────────────────────────────────────────────────────────────────
 *  L1. 초기 임베드 정화   : 페이지 HTML에 심어진 ytInitialPlayerResponse /
 *                          ytInitialData 를 setter/즉시-정화로 광고 제거
 *  L2. fetch 프록시       : /youtubei/v1/(player|browse|search|next|...)
 *                          응답 본문을 파싱→광고 제거→재직렬화하여 반환
 *  L3. XHR 프록시         : responseText / response 를 광고 제거본으로 대체
 *  L4. JSON.parse 후킹    : 위에서 놓친 모든 JSON 파싱 결과를 최종 정화
 *  L5. 광고 비컨 차단      : pagead / stats/ads / ptracking / doubleclick 등
 *                          광고·트래킹 요청을 fetch/sendBeacon 단에서 무력화
 *  L6. 플레이어 강제 스킵  : 광고가 재생되면 즉시 끝으로 seek + 음소거 + 스킵클릭
 *  L7. CSS 은닉           : 모든 광고 UI 컨테이너 display:none
 *  L8. DOM 제거           : MutationObserver 로 광고 요소·안티애드블록 팝업 제거
 *  L9. 탐지 플래그 무력화  : hasAllowedInstreamAd/adBlocksFound/팝업 설정 조작
 *
 *  ⚠ 서버 사이드 광고 삽입(SSAI)은 광고가 영상 스트림 자체에 합쳐져 전달되므로
 *    순수 유저스크립트로는 100% 제거가 불가능합니다(L6가 최대한 건너뜁니다).
 *    가장 확실한 조합은 "본 스크립트 + uBlock Origin(네트워크 필터)" 입니다.
 * ─────────────────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    // 중복 실행 방지 (embed iframe 등에서 여러 번 주입되는 경우)
    if (window.__YT_ULTIMATE_ADBLOCK__) return;
    window.__YT_ULTIMATE_ADBLOCK__ = true;

    /* ===================================================================== *
     *  0. 설정 (CONFIG)
     * ===================================================================== */
    const CONFIG = {
        debug: false,                 // true 로 두면 콘솔에 동작 로그 출력
        aggressiveAntiDetect: true,   // Object.prototype 플래그 조작(강력하지만 드물게 부작용 가능)
        blockAdBeacons: true,         // 광고/트래킹 요청 자체를 차단
        skipInterval: 200,            // 플레이어 광고 감시 주기(ms)
    };

    const log = (...a) => { if (CONFIG.debug) console.log('%c[YT-ADBLOCK]', 'color:#0a0', ...a); };

    /* ===================================================================== *
     *  원본 함수 레퍼런스 (후킹 전에 반드시 확보)
     * ===================================================================== */
    const _parse = JSON.parse.bind(JSON);
    const _stringify = JSON.stringify.bind(JSON);
    const _fetch = window.fetch ? window.fetch.bind(window) : null;
    const _xhrOpen = XMLHttpRequest.prototype.open;
    const _beacon = (navigator.sendBeacon && navigator.sendBeacon.bind(navigator)) || null;

    /* ===================================================================== *
     *  광고 식별 사전 (Ad dictionaries)
     * ===================================================================== */

    // (A) 객체 어디에서 발견되든 비우거나 삭제할 "광고 속성" 키
    //     - 배열 값은 []로, 그 외는 delete
    const AD_ATTRIBUTES = new Set([
        'adPlacements',          // 프리/미드/포스트롤 배치
        'adSlots',               // 광고 슬롯
        'playerAds',             // 플레이어 광고
        'adBreakHeartbeatParams',// 광고 브레이크 하트비트
        'adBreakParams',
        'adBreakServiceParams',
        'ssapConfig',            // Server-Side Ad Placement(서버측 광고) 설정
        'daiConfig',             // Dynamic Ad Insertion 설정
        'upsellDialogRenderer',  // 프리미엄 업셀 다이얼로그
        'adClientParams',        // Shorts 광고 마커(entries[].command.reelWatchEndpoint...)
    ]);

    // (B) 배열의 "항목"이 (또는 얕은 래퍼로 감싼 내용이) 이 렌더러를 가지면 항목 자체를 제거
    const AD_RENDERERS = new Set([
        'adSlotRenderer',
        'adsEngagementPanelContentRenderer',
        'bannerPromoRenderer',
        'brandVideoShelfRenderer',
        'brandVideoSingletonRenderer',
        'carouselAdRenderer',
        'compactPromotedItemRenderer',
        'compactPromotedVideoRenderer',
        'displayAdRenderer',
        'inFeedAdLayoutRenderer',
        'landscapeImageWideButtonAdRenderer',
        'mealbarPromoRenderer',            // "프리미엄 사용해보기" 등 하단 바
        'primetimePromoRenderer',
        'promotedSparklesTextSearchRenderer',
        'promotedSparklesWebRenderer',
        'promotedVideoRenderer',
        'searchPyvRenderer',               // 검색 상단 프로모션
        'statementBannerRenderer',         // "광고 차단기는 규정 위반" 배너
        'adDivMessageRenderer',
        'videoAdRenderer',
        'instreamVideoAdRenderer',
    ]);

    // 얕은 래퍼(광고가 이 안의 content/contents에 들어있는 경우 상위 항목 통째로 제거)
    const WRAPPER_KEYS = ['richItemRenderer', 'richSectionRenderer', 'itemSectionRenderer', 'elementRenderer'];

    /**
     * 배열 항목이 광고인지 판정
     */
    function isAdItem(item) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return false;

        // 1) 직접 광고 렌더러 보유
        for (const k of AD_RENDERERS) if (k in item) return true;

        // 2) Shorts 광고 마커
        try {
            if (item.command &&
                item.command.reelWatchEndpoint &&
                item.command.reelWatchEndpoint.adClientParams &&
                item.command.reelWatchEndpoint.adClientParams.isAd) {
                return true;
            }
        } catch (e) { /* noop */ }

        // 3) 얕은 래퍼 내부에 광고 렌더러
        for (const w of WRAPPER_KEYS) {
            const wrap = item[w];
            if (!wrap || typeof wrap !== 'object') continue;
            const content = wrap.content || wrap.contents;
            if (!content) continue;
            if (Array.isArray(content)) {
                for (const sub of content) {
                    if (sub && typeof sub === 'object') {
                        for (const k of AD_RENDERERS) if (k in sub) return true;
                    }
                }
            } else if (typeof content === 'object') {
                for (const k of AD_RENDERERS) if (k in content) return true;
            }
        }
        return false;
    }

    /**
     * 재귀적으로 데이터에서 광고를 제거한다.
     * - 객체: 광고 속성 키는 비우고/삭제, 나머지는 재귀
     * - 배열: 광고 항목 제거 후 나머지 재귀
     */
    function pruneAds(node, depth) {
        depth = depth || 0;
        if (node == null || typeof node !== 'object' || depth > 40) return node;

        if (Array.isArray(node)) {
            const out = [];
            for (let i = 0; i < node.length; i++) {
                const item = node[i];
                if (isAdItem(item)) continue;          // 광고 항목 스킵
                out.push(pruneAds(item, depth + 1));
            }
            return out;
        }

        for (const key in node) {
            if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
            if (AD_ATTRIBUTES.has(key)) {
                if (Array.isArray(node[key])) node[key] = [];
                else { try { delete node[key]; } catch (e) { node[key] = undefined; } }
                continue;
            }
            // 광고 렌더러가 배열이 아닌 객체 키로 직접 붙은 경우도 방어적으로 제거
            if (AD_RENDERERS.has(key)) {
                try { delete node[key]; } catch (e) { node[key] = undefined; }
                continue;
            }
            node[key] = pruneAds(node[key], depth + 1);
        }

        // 플레이어 응답이면 "광고 허용됨" 플래그를 켜서 탐지를 회피
        if ('videoDetails' in node || 'streamingData' in node) {
            node.hasAllowedInstreamAd = true;
        }
        return node;
    }

    /**
     * 네트워크 응답 텍스트를 광고 제거본으로 변환.
     * JSON이면 파싱→정화→재직렬화, 아니면(HTML 등) 광고 키를 문자열 치환으로 무력화.
     */
    function transformText(text, url) {
        if (!text || typeof text !== 'string') return text;
        // 광고 흔적이 전혀 없으면 그대로 통과(성능)
        if (text.indexOf('adPlacements') === -1 &&
            text.indexOf('adSlots') === -1 &&
            text.indexOf('playerAds') === -1 &&
            text.indexOf('ssapConfig') === -1 &&
            text.indexOf('adClientParams') === -1 &&
            text.indexOf('Renderer') === -1) {
            return text;
        }
        try {
            const data = _parse(text);
            const cleaned = pruneAds(data, 0);
            return _stringify(cleaned);
        } catch (e) {
            // JSON이 아닌 응답: 광고 키 이름을 깨뜨려 플레이어가 찾지 못하게 함
            return text
                .replace(/"adPlacements"/g, '"adPlacements_x"')
                .replace(/"adSlots"/g, '"adSlots_x"')
                .replace(/"playerAds"/g, '"playerAds_x"')
                .replace(/"ssapConfig"/g, '"ssapConfig_x"');
        }
    }

    /* ===================================================================== *
     *  엔드포인트 정규식
     * ===================================================================== */
    // 광고 데이터를 담아 오는 innertube 엔드포인트 (본문을 정화)
    const AD_DATA_ENDPOINTS = /\/youtubei\/v1\/(?:player|browse|search|next|reel_watch_sequence|get_watch|guide)(?:\?|$)/;
    // 광고/트래킹 전용 엔드포인트 (요청 자체를 차단)
    const AD_BEACON_URLS = /doubleclick\.net|googlesyndication\.com|googleadservices\.com|\/pagead\/|\/ptracking(?:[/?]|$)|\/api\/stats\/(?:ads|atr)(?:[/?]|$)|\/pcs\/activeview|\/youtubei\/v1\/player\/ad_break|\/get_midroll_/;

    /* ===================================================================== *
     *  L1. 초기 임베드(ytInitialPlayerResponse / ytInitialData) 정화
     * ===================================================================== */
    function hookGlobal(name) {
        try {
            let store = window[name];
            if (store) store = pruneAds(store, 0); // 이미 있으면 즉시 정화
            Object.defineProperty(window, name, {
                configurable: true,
                get() { return store; },
                set(v) { try { store = pruneAds(v, 0); } catch (e) { store = v; } }
            });
        } catch (e) {
            // 전역 var 로 이미 선언되어 non-configurable 인 경우: 제자리 정화만 시도
            try { if (window[name]) pruneAds(window[name], 0); } catch (_) {}
        }
    }
    hookGlobal('ytInitialPlayerResponse');
    hookGlobal('ytInitialData');

    /* ===================================================================== *
     *  L2. fetch 프록시
     * ===================================================================== */
    if (_fetch) {
        window.fetch = async function (input, init) {
            let url = '';
            try { url = (typeof input === 'string') ? input : (input && input.url) || ''; } catch (e) {}

            // L5: 광고 비컨/트래킹 요청 차단
            if (CONFIG.blockAdBeacons && url && AD_BEACON_URLS.test(url)) {
                log('block beacon (fetch):', url);
                return new Response('{}', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } });
            }

            const response = await _fetch(input, init);

            try {
                if (url && AD_DATA_ENDPOINTS.test(url) && response && response.ok) {
                    const cloned = response.clone();
                    const text = await cloned.text();
                    const cleaned = transformText(text, url);
                    if (cleaned !== text) {
                        log('cleaned fetch:', url);
                        const headers = new Headers(response.headers);
                        headers.delete('content-length');
                        headers.delete('content-encoding');
                        return new Response(cleaned, {
                            status: response.status,
                            statusText: response.statusText,
                            headers
                        });
                    }
                }
            } catch (e) { log('fetch transform error', e); }

            return response;
        };
    }

    /* ===================================================================== *
     *  L3. XHR 프록시 (best-effort)
     *  - open 시점에 리스너를 붙여 유튜브의 onreadystatechange 보다 먼저 실행되게 함
     * ===================================================================== */
    XMLHttpRequest.prototype.open = function (method, url) {
        try {
            const u = String(url || '');
            this.__ytUrl = u;

            if (u && AD_BEACON_URLS.test(u) && CONFIG.blockAdBeacons) {
                // 광고 비컨은 무해한 곳으로 우회(요청 무력화)
                arguments[1] = 'data:application/json,{}';
            } else if (u && AD_DATA_ENDPOINTS.test(u)) {
                this.addEventListener('readystatechange', function () {
                    if (this.readyState !== 4) return;
                    try {
                        // responseType 이 'json' 인 경우: 파싱된 객체를 정화본으로 교체
                        if (this.responseType === 'json') {
                            const orig = this.response;
                            if (orig && typeof orig === 'object') {
                                const cleaned = pruneAds(orig, 0);
                                Object.defineProperty(this, 'response', { configurable: true, get() { return cleaned; } });
                            }
                            return;
                        }
                        // text/기본: responseText 정화본으로 교체
                        const txt = this.responseText;
                        const cleaned = transformText(txt, this.__ytUrl);
                        if (cleaned !== txt) {
                            Object.defineProperty(this, 'responseText', { configurable: true, get() { return cleaned; } });
                            Object.defineProperty(this, 'response', { configurable: true, get() { return cleaned; } });
                        }
                    } catch (e) { /* 브라우저별 예외는 무시(안전) */ }
                });
            }
        } catch (e) { /* noop */ }
        return _xhrOpen.apply(this, arguments);
    };

    /* ===================================================================== *
     *  L4. JSON.parse 후킹 (최종 안전망)
     * ===================================================================== */
    JSON.parse = function (text, reviver) {
        const data = _parse(text, reviver);
        try {
            if (data && typeof data === 'object' &&
                typeof text === 'string' && text.length > 60) {
                return pruneAds(data, 0);
            }
        } catch (e) { /* noop */ }
        return data;
    };

    /* ===================================================================== *
     *  L5. sendBeacon 광고 트래킹 차단
     * ===================================================================== */
    if (_beacon && CONFIG.blockAdBeacons) {
        navigator.sendBeacon = function (url, data) {
            try { if (AD_BEACON_URLS.test(String(url))) { log('block beacon:', url); return true; } }
            catch (e) {}
            return _beacon(url, data);
        };
    }

    /* ===================================================================== *
     *  L9. 탐지 플래그 무력화
     * ===================================================================== */
    function defineProtoFlag(name, value) {
        try {
            if (Object.getOwnPropertyDescriptor(Object.prototype, name)) return;
            Object.defineProperty(Object.prototype, name, {
                configurable: true,
                enumerable: false,         // for..in / JSON 오염 방지
                get() { return value; },
                set() { /* 유튜브가 값을 써도 무시 → 탐지 카운터가 오르지 않음 */ }
            });
        } catch (e) { /* noop */ }
    }
    function neutralizeDetection() {
        if (CONFIG.aggressiveAntiDetect) {
            defineProtoFlag('hasAllowedInstreamAd', true); // "광고 재생 허용됨"으로 위장
            defineProtoFlag('adBlocksFound', 0);           // 탐지 카운터 0 고정
        }
        try {
            const cfg = window.yt && window.yt.config_;
            if (cfg && cfg.openPopupConfig && cfg.openPopupConfig.supportedPopups) {
                cfg.openPopupConfig.supportedPopups.adBlockMessageViewModel = false;
            }
        } catch (e) { /* yt.config_ 아직 없음 → 이후 주기적으로 재시도 */ }
    }
    neutralizeDetection();

    /* ===================================================================== *
     *  L6. 플레이어 강제 스킵
     * ===================================================================== */
    let adState = { active: false, savedMuted: null, savedRate: null };

    function forceSkip() {
        const player = document.getElementById('movie_player') ||
                       document.querySelector('.html5-video-player');
        if (!player) return;
        const video = document.querySelector('.html5-main-video') ||
                      player.querySelector('video') ||
                      document.querySelector('video');
        if (!video) return;

        const showing = player.classList.contains('ad-showing') ||
                        player.classList.contains('ad-interrupting');

        if (showing) {
            if (!adState.active) {
                adState.active = true;
                adState.savedMuted = video.muted;
                adState.savedRate = video.playbackRate;
            }
            video.muted = true;
            // 광고 구간을 즉시 끝으로 이동 (SSAI 포함 대부분의 광고를 건너뜀)
            if (isFinite(video.duration) && video.duration > 0) {
                try { video.currentTime = video.duration; } catch (e) {}
            } else {
                try { video.playbackRate = 16; } catch (e) {} // 길이를 모르면 초고속 재생
            }
            // 스킵 버튼(구/신 버전 전부) 클릭
            player.querySelectorAll(
                '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, ' +
                '.ytp-ad-skip-button-container button, .ytp-ad-survey-answer-button'
            ).forEach(b => { try { b.click(); } catch (e) {} });
            // 오버레이 광고 닫기
            player.querySelectorAll(
                '.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container button'
            ).forEach(b => { try { b.click(); } catch (e) {} });
        } else if (adState.active) {
            // 광고 종료 → 사용자 상태 복원
            if (adState.savedMuted !== null) video.muted = adState.savedMuted;
            if (adState.savedRate !== null && video.playbackRate >= 16) {
                video.playbackRate = adState.savedRate; // 우리가 올린 경우만 복원(유저 배속 보존)
            }
            adState = { active: false, savedMuted: null, savedRate: null };
        }
    }

    // 영상 요소에 이벤트 리스너 부착(빠른 반응)
    function attachVideoListeners() {
        const video = document.querySelector('.html5-main-video') || document.querySelector('video');
        if (video && !video.__ytAdblockBound) {
            video.__ytAdblockBound = true;
            ['timeupdate', 'loadstart', 'playing', 'durationchange'].forEach(ev =>
                video.addEventListener(ev, forceSkip, true));
            log('video listeners attached');
        }
    }

    /* ===================================================================== *
     *  L8. DOM 광고 요소 & 안티-애드블록 팝업 제거
     * ===================================================================== */
    const AD_SELECTORS = [
        // 홈/피드/검색/추천 광고
        'ytd-ad-slot-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-display-ad-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-promoted-sparkles-text-search-renderer',
        'ytd-promoted-video-renderer',
        'ytd-compact-promoted-video-renderer',
        'ytd-compact-promoted-item-renderer',
        'ytd-search-pyv-renderer',
        'ytd-carousel-ad-renderer',
        'ytd-brand-video-shelf-renderer',
        'ytd-brand-video-singleton-renderer',
        'ytd-primetime-promo-renderer',
        'ytd-statement-banner-renderer',
        'ytd-banner-promo-renderer',
        'ytd-banner-promo-renderer-background',
        // 프리미엄 업셀
        'ytd-mealbar-promo-renderer',
        'ytmusic-mealbar-promo-renderer',
        'ytmusic-statement-banner-renderer',
        // 마스트헤드(홈 상단 대형 광고)
        '#masthead-ad',
        'ytd-masthead-ad-v3-renderer',
        'ytd-video-masthead-ad-v3-renderer',
        'ytd-video-masthead-ad-advertiser-info-renderer',
        // 워치 페이지 사이드/플레이어 광고
        '#player-ads',
        '#panels ytd-ads-engagement-panel-content-renderer',
        // 안티-애드블록 팝업 관련
        'ytd-enforcement-message-view-model',
        'ytd-enforcement-message-renderer',
        'tp-yt-iron-overlay-backdrop',
    ];

    function sweepAds() {
        // 순수 광고 요소 제거
        AD_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => { try { el.remove(); } catch (e) {} });
        });
        // 안티-애드블록 팝업 처리(팝업/백드롭 제거 + 스크롤 복구 + 멈춘 영상 재생)
        defeatAntiAdblock();
    }

    function defeatAntiAdblock() {
        let hit = false;
        document.querySelectorAll(
            'ytd-enforcement-message-view-model, .ytmEnforcementMessageViewModelHost, ytd-enforcement-message-renderer'
        ).forEach(el => {
            hit = true;
            const dialog = el.closest('tp-yt-paper-dialog, ytd-popup-container, #dialog') || el;
            try { dialog.remove(); } catch (e) {}
        });
        // 배경 스크림 제거
        document.querySelectorAll('tp-yt-iron-overlay-backdrop').forEach(b => {
            try { b.remove(); hit = true; } catch (e) {}
        });
        if (hit) {
            try {
                document.documentElement.style.removeProperty('overflow');
                if (document.body) {
                    document.body.style.setProperty('overflow-y', 'auto', 'important');
                    document.body.removeAttribute('no-y-overflow');
                }
            } catch (e) {}
            // 팝업 때문에 멈춘 영상 재생
            const video = document.querySelector('.html5-main-video');
            if (video && video.paused) { video.play().catch(() => {}); }
            log('anti-adblock popup removed');
        }
    }

    /* ===================================================================== *
     *  L7. CSS 은닉 (광고 UI를 레이아웃에서 완전히 숨김)
     * ===================================================================== */
    const AD_CSS = `
        /* ── 피드/검색/추천 광고 ── */
        ytd-ad-slot-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-display-ad-renderer,
        ytd-promoted-sparkles-web-renderer,
        ytd-promoted-sparkles-text-search-renderer,
        ytd-promoted-video-renderer,
        ytd-compact-promoted-video-renderer,
        ytd-compact-promoted-item-renderer,
        ytd-search-pyv-renderer,
        ytd-carousel-ad-renderer,
        ytd-brand-video-shelf-renderer,
        ytd-brand-video-singleton-renderer,
        ytd-primetime-promo-renderer,
        ytd-statement-banner-renderer,
        ytd-banner-promo-renderer,
        ytd-banner-promo-renderer-background,
        ytd-mealbar-promo-renderer,
        ytmusic-mealbar-promo-renderer,
        ytmusic-statement-banner-renderer,
        ytmusic-fullbleed-thumbnail-renderer[is-ad],
        /* ── 마스트헤드 ── */
        #masthead-ad,
        ytd-masthead-ad-v3-renderer,
        ytd-video-masthead-ad-v3-renderer,
        ytd-video-masthead-ad-advertiser-info-renderer,
        /* ── 워치 페이지 사이드/플레이어 광고 ── */
        #player-ads,
        #panels ytd-ads-engagement-panel-content-renderer,
        ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"],
        /* ── 플레이어 내부 오버레이/배너 광고 UI ── */
        .ytp-ad-module,
        .ytp-ad-overlay-container,
        .ytp-ad-overlay-slot,
        .ytp-ad-image-overlay,
        .ytp-ad-progress-list,
        .video-ads.ytp-ad-module,
        /* ── Shorts 광고 ── */
        ytd-reel-video-renderer:has(ytd-ad-slot-renderer),
        ytm-reel-item-renderer:has(.ytwReelsPlayerAdViewModelHost),
        .ytwReelsPlayerAdViewModelHost,
        /* ── 안티-애드블록 팝업 ── */
        ytd-enforcement-message-view-model,
        ytd-enforcement-message-renderer,
        tp-yt-paper-dialog:has(ytd-enforcement-message-view-model),
        ytd-popup-container:has(ytd-enforcement-message-view-model),
        tp-yt-iron-overlay-backdrop {
            display: none !important;
        }
    `;

    function injectStyle(css) {
        try {
            const style = document.createElement('style');
            style.id = 'yt-ultimate-adblock-style';
            style.textContent = css;
            (document.head || document.documentElement).appendChild(style);
        } catch (e) { log('injectStyle failed', e); }
    }

    /* ===================================================================== *
     *  실행 스케줄러 (mutation 디바운스 + 하트비트 + SPA 내비게이션)
     * ===================================================================== */
    let scheduled = false;
    function runPasses() {
        scheduled = false;
        neutralizeDetection();
        forceSkip();
        attachVideoListeners();
        sweepAds();
    }
    function schedule() {
        if (scheduled) return;
        scheduled = true;
        (window.requestAnimationFrame || setTimeout)(runPasses);
    }

    function start() {
        injectStyle(AD_CSS);

        // DOM 변화 감시 → 광고 등장 즉시 제거
        const observer = new MutationObserver(schedule);
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // 하트비트(플레이어 광고 상태를 놓치지 않도록)
        setInterval(() => { forceSkip(); }, CONFIG.skipInterval);
        setInterval(schedule, 1000);

        // SPA 내비게이션 이벤트
        ['yt-navigate-finish', 'yt-page-data-updated', 'yt-player-updated'].forEach(ev =>
            document.addEventListener(ev, () => { schedule(); attachVideoListeners(); }, true));

        runPasses();
        log('YouTube Ultimate Adblock 활성화됨');
    }

    // CSS/DOM 관련 초기화는 documentElement 준비 후
    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();
