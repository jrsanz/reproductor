// Clase del reproductor personalizado
class CustomVideoPlayer {
    // Constructor
    constructor() {
        this.video = document.getElementById("videoPlayer")
        this.playPauseBtn = document.getElementById("playPauseBtn")
        this.muteBtn = document.getElementById("muteBtn")
        this.volumeControlContainer = document.getElementById("volumeControlContainer")
        this.volumeSlider = document.getElementById("volumeSlider")
        this.volumePercentage = document.getElementById("volumePercentage")
        this.videoTitleOverlay = document.getElementById("videoTitleOverlay")
        this.subtitlesBtn = document.getElementById("subtitlesBtn")
        this.screenshotBtn = document.getElementById("screenshotBtn")
        this.prevBtn = document.getElementById("prevBtn")
        this.nextBtn = document.getElementById("nextBtn")
        this.fullscreenBtn = document.getElementById("fullscreenBtn")
        this.helpBtn = document.getElementById("helpBtn")
        this.cheatsheetOverlay = document.getElementById("cheatsheetOverlay")
        this.cheatsheetClose = document.getElementById("cheatsheetClose")
        this.progressBar = document.querySelector(".progress-bar")
        this.progressFilled = document.getElementById("progressFilled")
        this.progressHandle = document.getElementById("progressHandle")
        this.currentTimeDisplay = document.getElementById("currentTime")
        this.durationDisplay = document.getElementById("duration")
        this.playlist = document.getElementById("playlist")
        this.screenshotOverlay = document.getElementById("screenshotOverlay")
        
        this.speedDisplay = document.getElementById("speedDisplay")
        this.speedOptions = document.getElementById("speedOptions")
        this.sizeDisplay = document.getElementById("sizeDisplay")
        this.sizeOptions = document.getElementById("sizeOptions")
        this.seekBackwardAnimation = document.getElementById("seekBackwardAnimation")
        this.seekForwardAnimation = document.getElementById("seekForwardAnimation")

        this.currentVideoIndex = 0
        this.videos = Array.from(document.querySelectorAll(".playlist-item"))
        this.isDragging = false
        this.subtitlesEnabled = false
        this.isFullscreen = false
        this.currentSpeed = 1
        this.currentSize = "fit-screen"
        this.video.className = "video-element " + this.currentSize

        this.playPauseAnimation = document.getElementById("playPauseAnimation")
        this.volumeAnimation = document.getElementById("volumeAnimation")
        this.progressTooltip = document.getElementById("progressTooltip")
        this.volumeTooltip = document.getElementById("volumeTooltip")
        this.screenshotsGrid = document.getElementById("screenshotsGrid")
        this.screenshots = []

        this.init()
    }

    // Inicializar el reproductor
    init() {
        this.setupEventListeners()
        this.loadVideo(0)
    }

    // Configurar los eventos
    setupEventListeners() {
        // Controles básicos
        this.playPauseBtn.addEventListener("click", () => this.togglePlayPauseWithAnimation())
        this.muteBtn.addEventListener("click", () => this.toggleMute())
        this.volumeControlContainer.addEventListener("mouseover", () => this.showVolume())
        this.volumeControlContainer.addEventListener("mouseout", () => this.hideVolume())
        this.subtitlesBtn.addEventListener("click", () => this.toggleSubtitles())
        this.screenshotBtn.addEventListener("click", () => this.takeScreenshot())
        this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen())
        this.helpBtn.addEventListener("click", () => this.toggleCheatsheet())
        this.cheatsheetClose.addEventListener("click", () => this.hideCheatsheet())
        this.prevBtn.addEventListener("click", () => this.previousVideo())
        this.nextBtn.addEventListener("click", () => this.nextVideo())

        // Velocidad de reproducción
        this.speedDisplay.addEventListener("click", (e) => {
            e.stopPropagation()
            this.toggleSpeedOptions()
        })

        // Tamaño de pantalla
        this.sizeDisplay.addEventListener("click", (e) => {
            e.stopPropagation()
            this.toggleSizeOptions()
        })

        // Opciones de velocidad
        this.speedOptions.querySelectorAll(".speed-option").forEach((option) => {
            option.addEventListener("click", (e) => {
                const speed = Number.parseFloat(e.target.dataset.speed)
                this.setPlaybackSpeed(speed)
                this.hideSpeedOptions()
            })
        })

        // Opciones de tamaño
        this.sizeOptions.querySelectorAll(".size-option").forEach((option) => {
            option.addEventListener("click", (e) => {
                const size = e.target.dataset.size
                this.setVideoSize(size)
                this.hideSizeOptions()
            })
        })

        // Cerrar opciones al hacer click fuera
        document.addEventListener("click", () => {
            this.hideSpeedOptions()
            this.hideSizeOptions()
        })

        // Cerrar cheatsheet al hacer click fuera
        this.cheatsheetOverlay.addEventListener("click", (e) => {
            if (e.target === this.cheatsheetOverlay) {
                this.hideCheatsheet()
            }
        })

        // Barra de progreso
        this.progressBar.addEventListener("click", (e) => this.seekTo(e))
        this.progressHandle.addEventListener("mousedown", (e) => this.startDragging(e))
        document.addEventListener("mousemove", (e) => this.drag(e))
        document.addEventListener("mouseup", () => this.stopDragging())

        // Lista de reproducción
        this.playlist.addEventListener("click", (e) => {
            const item = e.target.closest(".playlist-item")
            if (item) {
                const index = this.videos.indexOf(item)
                this.loadVideo(index)
            }
        })

        // Eventos del vídeo
        this.video.addEventListener("loadedmetadata", () => this.updateDuration())
        this.video.addEventListener("timeupdate", () => this.updateProgress())
        this.video.addEventListener("ended", () => this.nextVideo())

        // Teclas de acceso rápido
        document.addEventListener("keydown", (e) => this.handleKeyboard(e))

        // Escape para salir de pantalla completa
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isFullscreen) {
                this.toggleFullscreen()
            }
        })

        // Click en video para play/pause
        this.video.addEventListener("click", () => this.togglePlayPauseWithAnimation())

        // Doble click para avanzar/retroceder
        this.video.addEventListener("dblclick", (e) => this.handleDoubleClick(e))

        // Tooltips
        this.progressBar.addEventListener("mousemove", (e) => this.showProgressTooltip(e))
        this.progressBar.addEventListener("mouseleave", () => this.hideProgressTooltip())
        this.volumeSlider.addEventListener("mousemove", (e) => this.showVolumeTooltip(e))
        this.volumeSlider.addEventListener("mouseleave", () => this.hideVolumeTooltip())
        this.volumeSlider.addEventListener("click", (e) => {
            const rect = this.volumeSlider.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            const volume = percent * 100

            this.setVolume(volume)
            this.updateVolumeTooltip(volume)
        })

        // Agregar estos event listeners adicionales para fullscreen
        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement && this.isFullscreen) {
                this.toggleFullscreen()
            }
        })

        // Agregar estos event listeners adicionales para fullscreen
        document.addEventListener("webkitfullscreenchange", () => {
            if (!document.webkitFullscreenElement && this.isFullscreen) {
                this.toggleFullscreen()
            }
        })

        // Agregar estos event listeners adicionales para fullscreen
        document.addEventListener("mozfullscreenchange", () => {
            if (!document.mozFullScreenElement && this.isFullscreen) {
                this.isFullscreen = false
                this.fullscreenBtn.querySelector(".fullscreen-enter").style.display = "block"
                this.fullscreenBtn.querySelector(".fullscreen-exit").style.display = "none"
            }
        })

        // Agregar estos event listeners adicionales para fullscreen
        document.addEventListener("msfullscreenchange", () => {
            if (!document.msFullscreenElement && this.isFullscreen) {
                this.isFullscreen = false
                this.fullscreenBtn.querySelector(".fullscreen-enter").style.display = "block"
                this.fullscreenBtn.querySelector(".fullscreen-exit").style.display = "none"
            }
        })
    }

    // Reproducir o pausar el vídeo
    togglePlayPause() {
        if (this.video.paused) {
            this.video.play()
            this.playPauseBtn.querySelector(".play-icon").style.display = "none"
            this.playPauseBtn.querySelector(".pause-icon").style.display = "block"
        } else {
            this.video.pause()
            this.playPauseBtn.querySelector(".play-icon").style.display = "block"
            this.playPauseBtn.querySelector(".pause-icon").style.display = "none"
        }
    }

    // Mutear o desmutear el audio del vídeo
    toggleMute() {
        this.video.muted = !this.video.muted
        if (this.video.muted) {
            this.muteBtn.querySelector(".volume-icon").style.display = "none"
            this.muteBtn.querySelector(".mute-icon").style.display = "block"
            this.volumeSlider.value = 0
        } else {
            this.muteBtn.querySelector(".volume-icon").style.display = "block"
            this.muteBtn.querySelector(".mute-icon").style.display = "none"
            const volume = this.video.volume * 100
            this.volumeSlider.value = volume
        }
    }

    // Mostrar el slider de volumen
    showVolume() {
        document.querySelector(".volume-slider").style.width = "80px"
        document.querySelector(".volume-slider").style.opacity = "1"
        document.querySelector(".volume-slider").style.marginLeft = "10px"
    }

    // Ocultar el slider de volumen
    hideVolume() {
        document.querySelector(".volume-slider").style.width = "0"
        document.querySelector(".volume-slider").style.opacity = "0"
        document.querySelector(".volume-slider").style.marginLeft = "0"
    }

    // Establecer el volumen
    setVolume(value) {
        const volume = this.formatVolume(value)
        this.video.volume = volume / 100
        this.video.muted = volume == 0
        this.updateVolumeTooltip(volume)
        this.volumeSlider.value = volume

        if (volume == 0) {
            this.muteBtn.querySelector(".volume-icon").style.display = "none"
            this.muteBtn.querySelector(".mute-icon").style.display = "block"
        } else {
            this.muteBtn.querySelector(".volume-icon").style.display = "block"
            this.muteBtn.querySelector(".mute-icon").style.display = "none"
        }
    }

    // Establecer la velocidad de reproducción
    setPlaybackSpeed(speed) {
        this.currentSpeed = speed
        this.video.playbackRate = speed
        this.speedDisplay.textContent = speed + "x"

        // Actualizar opciones activas
        this.speedOptions.querySelectorAll(".speed-option").forEach((option) => {
            option.classList.remove("active")
            if (Number.parseFloat(option.dataset.speed) === speed) {
                option.classList.add("active")
            }
        })
    }

    // Establecer el tamaño del vídeo
    setVideoSize(size) {
        this.currentSize = size
        this.video.className = "video-element " + size

        this.sizeOptions.querySelectorAll(".size-option").forEach((option) => {
            option.classList.remove("active")
            if (option.dataset.size === size) {
                option.classList.add("active")
            }
        })
    }

    // Entrar o salir de pantalla completa
    toggleFullscreen() {
        if (!this.isFullscreen) {
            // Entrar en pantalla completa usando la API nativa
            const videoWrapper = document.querySelector(".video-wrapper")

            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen()
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen()
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen()
            } else if (videoWrapper.mozRequestFullScreen) {
                videoWrapper.mozRequestFullScreen()
            }

            this.isFullscreen = true
            this.fullscreenBtn.querySelector(".fullscreen-enter").style.display = "none"
            this.fullscreenBtn.querySelector(".fullscreen-exit").style.display = "block"
        } else {
            // Salir de pantalla completa
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            }

            this.isFullscreen = false
            this.fullscreenBtn.querySelector(".fullscreen-enter").style.display = "block"
            this.fullscreenBtn.querySelector(".fullscreen-exit").style.display = "none"
        }
    }

    // Mostrar las opciones de velocidad
    toggleSpeedOptions() {
        this.speedOptions.classList.toggle("show")
    }

    // Ocultar las opciones de velocidad
    hideSpeedOptions() {
        this.speedOptions.classList.remove("show")
    }

    // Mostrar las opciones de tamaño
    toggleSizeOptions() {
        this.sizeOptions.classList.toggle("show")
    }

    // Ocultar las opciones de tamaño
    hideSizeOptions() {
        this.sizeOptions.classList.remove("show")
    }

    // Mostrar el cheatsheet
    toggleCheatsheet() {
        this.cheatsheetOverlay.classList.toggle("show")
    }

    // Ocultar el cheatsheet
    hideCheatsheet() {
        this.cheatsheetOverlay.classList.remove("show")
    }

    // Mostrar u ocultar los subtitulos
    toggleSubtitles() {
        const tracks = this.video.textTracks
        this.subtitlesEnabled = !this.subtitlesEnabled

        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = this.subtitlesEnabled ? "showing" : "hidden"
        }

        this.subtitlesBtn.style.background = this.subtitlesEnabled ? "rgba(255, 107, 107, 0.5)" : "rgba(255, 255, 255, 0.1)"
    }

    // Capturar un screenshot del vídeo
    takeScreenshot() {
        try {
            // Verificar si el video está listo
            if (this.video.readyState < 2) {
                throw new Error("Video no está listo para captura")
            }

            if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
                throw new Error("Dimensiones del video no disponibles")
            }

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            canvas.width = this.video.videoWidth
            canvas.height = this.video.videoHeight

            // Configurar canvas para evitar problemas de CORS
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"

            // Dibujar el frame actual del video
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height)

            // Verificar que se dibujó algo
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const hasContent = imageData.data.some(pixel => pixel !== 0)

            if (!hasContent) {
                throw new Error("No se pudo capturar el contenido del video")
            }

            // Crear imagen para descarga
            const dataUrl = canvas.toDataURL("image/png", 1.0)
            const link = document.createElement("a")
            const timestamp = new Date().toLocaleString()
            link.download = `screenshot-${Date.now()}.png`
            link.href = dataUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Agregar a la lista de capturas
            const screenshot = {
                id: Date.now(),
                dataUrl: dataUrl,
                time: this.video.currentTime,
                timestamp: timestamp,
            }

            this.screenshots.push(screenshot)
            this.addScreenshotToGrid(screenshot)

            // Mostrar mensaje de confirmación
            this.screenshotOverlay.innerHTML =`
                <div>📸 Captura guardada</div>
                <div style="font-size: 12px; margin-top: 5px;">${timestamp}</div>
            `
            this.screenshotOverlay.classList.add("show")
            setTimeout(() => {
                this.screenshotOverlay.classList.remove("show")
            }, 2500)
        } catch (error) {
            console.error("Error al tomar captura:", error)
            this.screenshotOverlay.innerHTML = `<div>❌ Error: ${error.message}</div>`
            this.screenshotOverlay.classList.add("show")
            setTimeout(() => {
                this.screenshotOverlay.classList.remove("show")
            }, 3000)
        }
    }

    // Cambiar al vídeo anterior en la lista
    previousVideo() {
        this.currentVideoIndex = this.currentVideoIndex > 0 ? this.currentVideoIndex - 1 : this.videos.length - 1
        this.loadVideo(this.currentVideoIndex)
    }

    // Cambiar al vídeo siguiente en la lista
    nextVideo() {
        this.currentVideoIndex = this.currentVideoIndex < this.videos.length - 1 ? this.currentVideoIndex + 1 : 0
        this.loadVideo(this.currentVideoIndex)
    }

    // Cargar un vídeo de la lista
    loadVideo(index) {
        this.currentVideoIndex = index
        const videoData = this.videos[index]
        const src = videoData.dataset.src
        const title = videoData.dataset.title

        // Actualizar video
        this.video.src = src
        this.video.load()

        // Actualizar título en overlay
        this.videoTitleOverlay.textContent = title

        // Resetear barra de progreso
        this.video.currentTime = 0
        this.progressFilled.style.width = "0%"
        this.progressHandle.style.left = "0%"
        this.currentTimeDisplay.textContent = "00:00"

        // Actualizar lista de reproducción
        this.videos.forEach((item) => item.classList.remove("active"))
        videoData.classList.add("active")

        // Resetear controles
        this.playPauseBtn.querySelector(".play-icon").style.display = "block"
        this.playPauseBtn.querySelector(".pause-icon").style.display = "none"
    }

    // Manejar doble click para retroceder o avanzar 10 segundos en el vídeo
    handleDoubleClick(e) {
        const rect = this.video.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const videoWidth = rect.width

        if (clickX < videoWidth / 2) {
            // Doble click izquierda - retroceder 10 segundos
            this.video.currentTime = Math.max(0, this.video.currentTime - 10)
            this.showSeekAnimation("backward")
        } else {
            // Doble click derecha - avanzar 10 segundos
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10)
            this.showSeekAnimation("forward")
        }
    }

    // Mostrar animación de movimiento de barra de progreso
    showSeekAnimation(direction) {
        const animation = direction === "backward" ? this.seekBackwardAnimation : this.seekForwardAnimation
        animation.classList.add("show")
        setTimeout(() => {
            animation.classList.remove("show")
        }, 600)
    }

    // Actualizar barra de progreso al hacer clic
    seekTo(e) {
        const rect = this.progressBar.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        this.video.currentTime = percent * this.video.duration
    }

    startDragging(e) {
        this.isDragging = true
        e.preventDefault()
    }

    drag(e) {
        if (!this.isDragging) return

        const rect = this.progressBar.getBoundingClientRect()
        let percent = (e.clientX - rect.left) / rect.width
        percent = Math.max(0, Math.min(1, percent))

        // Actualizar visualmente en tiempo real
        this.progressFilled.style.width = percent * 100 + "%"
        this.progressHandle.style.left = percent * 100 + "%"

        // Actualizar tiempo del video
        this.video.currentTime = percent * this.video.duration
    }

    stopDragging() {
        this.isDragging = false
    }

    // Actualizar barra de progreso
    updateProgress() {
        if (this.isDragging) return

        const percent = (this.video.currentTime / this.video.duration) * 100
        this.progressFilled.style.width = percent + "%"
        this.progressHandle.style.left = percent + "%"

        this.currentTimeDisplay.textContent = this.formatTime(this.video.currentTime)
    }

    // Actualizar duración
    updateDuration() {
        this.durationDisplay.textContent = this.formatTime(this.video.duration)
    }

    // Formatear tiempo en minutos y segundos
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Formatear volumen entre 0 y 100
    formatVolume(volume) {
        if (volume < 0) return 0
        else if (volume > 100) return 100
        else return volume
    }

    // Eventos de teclado
    handleKeyboard(e) {
        switch (e.code) {
            case "Space":
                e.preventDefault()
                this.togglePlayPauseWithAnimation()
                break
            case "KeyM":
                this.toggleMute()
                break
            case "ArrowLeft":
                this.video.currentTime -= 10
                this.showSeekAnimation("backward")
                break
            case "ArrowRight":
                this.video.currentTime += 10
                this.showSeekAnimation("forward")
                break
            case "ArrowUp":
                e.preventDefault()
                this.setVolume(Math.min(100, this.video.volume * 100 + 10))
                this.volumeSlider.value = this.video.volume * 100
                this.showVolumeAnimation("up")
                break
            case "ArrowDown":
                e.preventDefault()
                this.setVolume(Math.max(0, this.video.volume * 100 - 10))
                this.volumeSlider.value = this.video.volume * 100
                this.showVolumeAnimation("down")
                break
            case "KeyF":
                this.toggleFullscreen()
                break
        }
    }

    // Función para alternar el estado de reproducción con animación de reproducción/pausa
    togglePlayPauseWithAnimation() {
        this.togglePlayPause()
        this.showPlayPauseAnimation()
    }

    // Mostrar animación de reproducción/pausa
    showPlayPauseAnimation() {
        const playIcon = this.playPauseAnimation.querySelector(".play-icon-anim")
        const pauseIcon = this.playPauseAnimation.querySelector(".pause-icon-anim")

        if (this.video.paused) {
            playIcon.style.display = "block"
            pauseIcon.style.display = "none"
        } else {
            playIcon.style.display = "none"
            pauseIcon.style.display = "block"
        }

        this.playPauseAnimation.classList.add("show")
        setTimeout(() => {
            this.playPauseAnimation.classList.remove("show")
        }, 600)
    }

    // Mostrar animación de reproducción/pausa
    showVolumeAnimation(option) {
        const increaseVolumeIcon = this.volumeAnimation.querySelector(".increase-volume-icon-anim")
        const decreaseVolumeIcon = this.volumeAnimation.querySelector(".decrease-volume-icon-anim")

        if (option === "up") {
            increaseVolumeIcon.style.display = "block"
            decreaseVolumeIcon.style.display = "none"
        } else {
            increaseVolumeIcon.style.display = "none"
            decreaseVolumeIcon.style.display = "block"
        }

        this.volumeAnimation.classList.add("show")
        setTimeout(() => {
            this.volumeAnimation.classList.remove("show")
        }, 600)
    }

    // Mostrar tooltip de la barra de progreso
    showProgressTooltip(e) {
        const rect = this.progressBar.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        const time = percent * this.video.duration

        this.progressTooltip.textContent = this.formatTime(time)
        this.progressTooltip.style.left = `${percent * 100}%`
        this.progressTooltip.classList.add("show")
    }

    // Ocultar tooltip de la barra de progreso
    hideProgressTooltip() {
        this.progressTooltip.classList.remove("show")
    }

    // Mostrar tooltip del volumen
    showVolumeTooltip(e) {
        const rect = this.volumeSlider.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        const volume = this.formatVolume(percent * 100)

        this.volumeTooltip.textContent = Math.round(volume)
        this.volumeTooltip.classList.add("show")
    }

    // Ocultar tooltip del volumen
    hideVolumeTooltip() {
        this.volumeTooltip.classList.remove("show")
    }

    // Actualizar tooltip del volumen
    updateVolumeTooltip(value) {
        this.volumeTooltip.textContent = this.formatVolume(Math.round(value))
    }

    // Agregar captura de pantalla a la sección de capturas
    addScreenshotToGrid(screenshot) {
        const screenshotElement = document.createElement("div")
        screenshotElement.className = "screenshot-item"
        screenshotElement.innerHTML = `
            <img src="${screenshot.dataUrl}" alt="Screenshot">
            <div class="screenshot-time">${this.formatTime(screenshot.time)}</div>
        `

        screenshotElement.addEventListener("click", () => {
            // Descargar la captura al hacer click
            const link = document.createElement("a")
            link.download = `screenshot-${screenshot.id}.png`
            link.href = screenshot.dataUrl
            link.click()
        })

        this.screenshotsGrid.appendChild(screenshotElement)
    }
}

// Crear archivos de subtítulos
const createSubtitleFiles = () => {
    // Actualiza la pista de subtítulos
    const video = document.getElementById("videoPlayer")
    const tracks = video.querySelectorAll("track")

    // Asigna la pista de subtítulos
    tracks[0].src = "subs/subtitles.vtt"

    // Oculta la pista de subtítulos
    video.textTracks[0].mode = "hidden"
}

// Inicializar el reproductor cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    createSubtitleFiles()
    new CustomVideoPlayer()
})
