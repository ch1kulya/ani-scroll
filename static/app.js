const API_BASE_URL = "https://anilibria.top/api/v1";
const API_RANDOM_URL = `${API_BASE_URL}/anime/releases/random`;
const API_STATUS_URL = `${API_BASE_URL}/app/status`;
const API_RELEASE_URL = `${API_BASE_URL}/anime/releases`;

console.log("=== Конфигурация API ===");
console.log("API_BASE_URL:", API_BASE_URL);
console.log("API_RANDOM_URL:", API_RANDOM_URL);
console.log("API_STATUS_URL:", API_STATUS_URL);
console.log("API_RELEASE_URL:", API_RELEASE_URL);
console.log("=======================");

const genreColors = {
    "Экшен": "rgba(255, 99, 71, 0.7)",
    "Комедия": "rgba(255, 165, 0, 0.7)",
    "Драма": "rgba(30, 144, 255, 0.7)",
    "Фэнтези": "rgba(138, 43, 226, 0.7)",
    "Романтика": "rgba(255, 105, 180, 0.7)",
    "Ужасы": "rgba(139, 0, 0, 0.7)",
    "Приключения": "rgba(60, 179, 113, 0.7)",
    "Фантастика": "rgba(0, 128, 128, 0.7)",
    "Мистика": "rgba(128, 0, 128, 0.7)",
    "Повседневность": "rgba(135, 206, 235, 0.7)",
    "Школа": "rgba(255, 182, 193, 0.7)",
    "Сёнен": "rgba(255, 140, 0, 0.7)"
};

const App = {
    titles: [],
    isLoading: false,
    showImages: true,
    selectedTitle: null,

    // Получение статуса API при инициализации
    getApiStatus: async function() {
        try {
            console.log("Проверка статуса API...");
            console.log("URL для статуса:", API_STATUS_URL);
            
            const status = await m.request({
                method: "GET",
                url: API_STATUS_URL,
                extract: function(xhr) {
                    console.log("Status API response:", xhr.status);
                    console.log("Status API headers:", xhr.getAllResponseHeaders());
                    return xhr.responseText;
                }
            }).then(function(responseText) {
                console.log("Status API raw response:", responseText);
                try {
                    return JSON.parse(responseText);
                } catch (e) {
                    console.error("Status API JSON parse error:", e);
                    return null;
                }
            });
            
            if (status) {
                console.log("=== API Status ===");
                console.log("API is alive:", status.is_alive);
                console.log("Your IP:", status.request?.ip);
                console.log("Your Country:", status.request?.country);
                console.log("Available endpoints:", status.available_api_endpoints);
                console.log("==================");
            }
        } catch (error) {
            console.error("Не удалось получить статус API:", error);
            console.error("Возможно проблема с CORS. Проверьте настройки сервера.");
        }
    },

    loadMoreTitles: async function(count) {
        if (App.isLoading) return;
        App.isLoading = true;
        
        console.log(`Начинаем загрузку ${count} тайтлов...`);
        
        try {
            let titlesFetched = 0;
            while (titlesFetched < count) {
                console.log(`Загрузка тайтла ${titlesFetched + 1}/${count}...`);
                
                // Получаем случайный релиз
                const url = `${API_RANDOM_URL}?limit=1`;
                console.log("Запрос к:", url);
                
                const result = await m.request({
                    method: "GET",
                    url: url,
                    extract: function(xhr) {
                        console.log("Response status:", xhr.status);
                        console.log("Response headers:", xhr.getAllResponseHeaders());
                        return xhr.responseText;
                    }
                }).then(function(responseText) {
                    console.log("Raw response:", responseText);
                    try {
                        return JSON.parse(responseText);
                    } catch (e) {
                        console.error("JSON parse error:", e);
                        return null;
                    }
                });
                
                console.log("Parsed result:", result);
                
                if (Array.isArray(result) && result.length > 0) {
                    const title = result[0];
                    console.log("Получен тайтл:", title.id, title.name?.main);
                    
                    if (!App.titles.find(t => t.id === title.id)) {
                        const fullTitle = await App.loadFullRelease(title.id);
                        if (fullTitle) {
                            console.log("Полные данные загружены для:", fullTitle.name?.main);
                            App.titles.push(fullTitle);
                            titlesFetched++;
                            m.redraw();
                        }
                    } else {
                        console.log("Дубликат тайтла найден, повторный запрос...");
                    }
                } else {
                    console.error("Неожиданный формат ответа:", result);
                }
                
                await new Promise(resolve => setTimeout(resolve, 75));
            }
        } catch (error) {
            console.error("Error fetching titles:", error);
            console.error("Error details:", error.message, error.stack);
        } finally {
            App.isLoading = false;
            console.log("Загрузка завершена. Всего тайтлов:", App.titles.length);
        }
    },    

    loadFullRelease: async function(releaseId) {
        try {
            const url = `${API_RELEASE_URL}/${releaseId}`;
            console.log("Загрузка полных данных релиза:", url);
            
            const result = await m.request({
                method: "GET",
                url: url,
                extract: function(xhr) {
                    console.log("Full release response status:", xhr.status);
                    return xhr.responseText;
                }
            }).then(function(responseText) {
                console.log("Full release raw response:", responseText.substring(0, 200) + "...");
                try {
                    return JSON.parse(responseText);
                } catch (e) {
                    console.error("Full release JSON parse error:", e);
                    return null;
                }
            });
            
            console.log("Full release parsed result:", result);
            
            if (Array.isArray(result) && result.length > 0) {
                console.log("Эпизодов в релизе:", result[0].episodes?.length || 0);
                return result[0];
            } else if (result && typeof result === 'object' && !Array.isArray(result)) {
                console.log("API вернул объект вместо массива");
                return result;
            }
            return null;
        } catch (error) {
            console.error(`Не удалось загрузить полные данные релиза ${releaseId}:`, error);
            return null;
        }
    },

    toggleImages: function() {
        App.showImages = !App.showImages;
        App.selectTitle(null);
        localStorage.setItem('showImages', App.showImages);
        const imageToggleBtn = document.getElementById('image-toggle');
        imageToggleBtn.textContent = App.showImages ? '🎨' : '⚡';
        m.redraw();
    },

    selectTitle: function(title) {
        App.selectedTitle = title;
        m.redraw();
    },

    oninit: function() {
        const savedShowImages = localStorage.getItem('showImages');
        if (savedShowImages !== null) {
            App.showImages = savedShowImages === 'true';
        }
        
        App.getApiStatus();
        
        console.log("Проверка доступности API...");
        fetch(API_RANDOM_URL + "?limit=1")
            .then(response => {
                console.log("Fetch response:", response);
                console.log("Fetch status:", response.status);
                console.log("Fetch headers:", response.headers);
                return response.text();
            })
            .then(text => {
                console.log("Fetch response text:", text);
                try {
                    const json = JSON.parse(text);
                    console.log("Fetch parsed JSON:", json);
                } catch (e) {
                    console.error("Fetch JSON parse error:", e);
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
        
        App.loadMoreTitles(5);
        
        window.addEventListener('scroll', App.onScroll);
        const imageToggleBtn = document.getElementById('image-toggle');
        imageToggleBtn.addEventListener('click', App.toggleImages);
        imageToggleBtn.textContent = App.showImages ? '🎨' : '⚡';
    },

    onremove: function() {
        window.removeEventListener('scroll', App.onScroll);
        const imageToggleBtn = document.getElementById('image-toggle');
        imageToggleBtn.removeEventListener('click', App.toggleImages);
    },

    onScroll: function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.offsetHeight;

        if (scrollTop + windowHeight >= documentHeight - 100 && !App.isLoading) {
            App.loadMoreTitles(5);
        }
    },

    view: function() {
        return m(".container", [
            App.isLoading && App.titles.length === 0 ? 
                m(".loading-message", {
                    style: { 
                        textAlign: "center", 
                        padding: "50px",
                        fontSize: "18px"
                    }
                }, [
                    m(".spinner"),
                    m("p", "Загрузка релизов..."),
                    m("p", { style: { fontSize: "14px", color: "#666" } }, 
                        "Проверьте консоль браузера для отладочной информации")
                ]) : null,
            App.titles.map(title => m(TitleBlock, { data: title, showImages: App.showImages })),
            App.isLoading && App.titles.length > 0 ? m(".spinner") : null,
            !App.isLoading && App.titles.length === 0 ? 
                m(".no-content", {
                    style: { 
                        textAlign: "center", 
                        padding: "50px",
                        fontSize: "16px",
                        color: "#666"
                    }
                }, [
                    m("p", "Не удалось загрузить релизы"),
                    m("p", "Проверьте консоль браузера для деталей ошибки"),
                    m("button", {
                        onclick: () => App.loadMoreTitles(5),
                        style: {
                            padding: "10px 20px",
                            marginTop: "20px",
                            cursor: "pointer"
                        }
                    }, "Попробовать снова")
                ]) : null
        ]);
    }
};

const TitleBlock = {
    oninit: function(vnode) {
        vnode.state.showPlayerModal = false;
        vnode.state.isClosing = false;
    },
    view: function(vnode) {
        const data = vnode.attrs.data;
        const showImages = vnode.attrs.showImages;
        const titleRu = data.name?.main || "Название неизвестно";
        const year = data.year || "Год неизвестен";
        const genresArray = data.genres || [];
        const type = data.type?.description || "Тип неизвестен";
        const description = data.description || "Нет описания";
        const posterUrl = data.poster?.optimized?.src || data.poster?.src || "";
        const fullPosterUrl = posterUrl ? `https://anilibria.top${posterUrl}` : "";
        const isClosing = vnode.state.isClosing;
        const showPlayerModal = vnode.state.showPlayerModal;
        
        return m(".title-block", [
            m(".title-content", [
                showImages && fullPosterUrl ? m("img.poster", { 
                    src: fullPosterUrl, 
                    alt: titleRu, 
                    loading: "lazy" 
                }) : null,
                m(".title-info", [
                    m("h2", titleRu),
                    m("p", [m("strong", "Год: "), year]),
                    genresArray.length > 0 ? m("p", [
                        m("strong", "Жанры: "),
                        genresArray.map((genre, index) => {
                            const genreName = genre.name || genre;
                            const decorationColor = showImages && genreColors[genreName] ? genreColors[genreName] : null;
                            return [
                                decorationColor ? m("span", { 
                                    style: { 
                                        textDecoration: "underline", 
                                        textDecorationColor: decorationColor, 
                                        textDecorationThickness: "2px",
                                        textUnderlineOffset: "3px"
                                    } 
                                }, genreName) : genreName,
                                index < genresArray.length - 1 ? ", " : ""
                            ];
                        })
                    ]) : null,
                    m("p", [
                        m("strong", "Тип: "), 
                        type,
                        data.episodes_total && data.episodes_total > 1 ? ` (${data.episodes_total} эп.)` : ""
                    ])
                ])
            ]),
            m(".content-wrapper", [
                m(".title-description", m("p", [
                    description,
                    showImages ? m("span", {
                        class: "play-button-inline",
                        title: "Открыть плеер",
                        onclick: (e) => {
                            e.stopPropagation();
                            App.selectTitle(data);
                            vnode.state.showPlayerModal = true;
                            m.redraw();
                        }
                    }, m.trust('&#8203;'),
                    m("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            class: "play-icon"
                        }, m("polygon", { points: "5 3 19 12 5 21 5 3" }))
                    ) : null
                ])),
                m(".player-overlay", { 
                    class: showPlayerModal && !isClosing ? "visible" : "hidden",
                    onclick: () => {
                        vnode.state.isClosing = true;
                        m.redraw();
                        setTimeout(() => {
                            vnode.state.isClosing = false;
                            vnode.state.showPlayerModal = false;
                            App.selectTitle(null);
                            m.redraw();
                        }, 300);
                    }
                }),
                m(".player-container.modal", { 
                    class: showPlayerModal && !isClosing ? "visible" : "hidden"
                }, 
                    (showPlayerModal || isClosing) && data.episodes && data.episodes.length > 0 ? 
                        m(Player, { title: data }) : 
                        (showPlayerModal || isClosing) ? m("p", "Нет доступных эпизодов для этого тайтла") : null
                )
            ])
        ]);
    }
};

const Player = {
    oninit: function(vnode) {
        const title = vnode.attrs.title;
        const episodes = title.episodes || [];
        if (episodes.length === 0) {
            console.error("Нет доступных серий для данного тайтла.");
            this.selectedEpisode = null;
            return;
        }
        this.episodes = episodes.sort((a, b) => {
            const orderA = a.ordinal || a.sort_order || 0;
            const orderB = b.ordinal || b.sort_order || 0;
            return orderA - orderB;
        });
        this.selectedEpisode = this.episodes[0];
        this.hls = null;
        this.lastLoadedEpisodeId = null;
        this.inputWidth = this.calculateInputWidth(this.episodes.length);
    },
    selectedEpisode: null,
    episodes: [],
    hls: null,
    lastLoadedEpisodeId: null,
    inputWidth: "40px", // Начальная ширина
    calculateInputWidth: function(maxEpisodes) {
        // Определяем количество символов в максимальном номере серии
        const numDigits = maxEpisodes.toString().length;
        return Math.max(30, 20 + (numDigits * 10)) + "px";
    },
    oncreate: function(vnode) {
        this.onupdate(vnode);
    },    
    onremove: function() {
        if (this.hls) {
            this.hls.destroy();
        }
    },
    view: function(vnode) {
        const title = vnode.attrs.title;
        if (!this.episodes || this.episodes.length === 0) {
            return m(".player-container", [
                m("h2", title.name?.main),
                m("p", "Нет доступных серий для воспроизведения.")
            ]);
        }
        const handleSerieChange = (e) => {
            const episodeNumber = parseInt(e.target.value, 10);
            // Проверяем, что введено корректное число
            if (!isNaN(episodeNumber) && episodeNumber >= 1 && episodeNumber <= this.episodes.length) {
                const episode = this.episodes.find((ep, index) => {
                    return (index + 1) === episodeNumber;
                });
                if (episode) {
                    this.selectedEpisode = episode;
                    m.redraw();
                }
            }
        };
        const currentEpisodeNumber = this.episodes.findIndex(ep => ep.id === this.selectedEpisode.id) + 1;
        return m(".player-container", { 
            style: { 
                position: "relative",
                width: "100%", 
                maxWidth: "900px",
                margin: "0",
            } 
        }, [
            m("video", { 
                controls: true, 
                autoplay: true, 
                style: { width: "100%", height: "auto", margin: "0"}
            }),
            m(".serie-selector", {
                style: {
                    position: "absolute",
                    top: "0",
                    right: "0",
                    padding: "7px",
                    backgroundColor: "var(--background-color)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 10
                }
            }, [
                m("label", { 
                    for: "serie-input", 
                    style: { 
                        marginRight: "5px" ,
                    } 
                }, "Серия:"),
                m("input#serie-input", {
                    type: "number",
                    min: 1,
                    max: this.episodes.length,
                    value: currentEpisodeNumber,
                    oninput: handleSerieChange,
                    style: { 
                        width: this.inputWidth,
                        height: "20px",
                        textAlign: "center",
                        padding: "0 2px"
                    }
                })
            ])
        ]);
    },    
    onupdate: function(vnode) {
        if (this.selectedEpisode && this.selectedEpisode.id !== this.lastLoadedEpisodeId) {
            this.lastLoadedEpisodeId = this.selectedEpisode.id;
            const video = vnode.dom.querySelector('video');
            const videoSrc = this.selectedEpisode.hls_1080 || 
                           this.selectedEpisode.hls_720 || 
                           this.selectedEpisode.hls_480;
            if (!videoSrc) {
                console.error("Нет доступных ссылок на видео для эпизода:", this.selectedEpisode);
                return;
            }
            const fullVideoSrc = videoSrc.startsWith('http') ? videoSrc : `https://anilibria.top${videoSrc}`;
            if (this.hls) {
                this.hls.destroy();
            }
            if (Hls.isSupported()) {
                this.hls = new Hls();
                this.hls.loadSource(fullVideoSrc);
                this.hls.attachMedia(video);
                this.hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(e => {
                        console.log("Автовоспроизведение заблокировано браузером");
                    });
                });
                this.hls.on(Hls.Events.ERROR, function(event, data) {
                    console.error("HLS error:", data);
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = fullVideoSrc;
                video.addEventListener('loadedmetadata', function() {
                    video.play().catch(e => {
                        console.log("Автовоспроизведение заблокировано браузером");
                    });
                });
            } else {
                console.error("HLS не поддерживается в этом браузере.");
                video.src = fullVideoSrc;
            }
        }
    },
};

m.mount(document.getElementById("app"), App);