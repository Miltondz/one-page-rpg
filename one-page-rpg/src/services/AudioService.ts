/**
 * Audio Service - Sistema de audio contextual
 * 
 * Gestiona música de fondo y efectos de sonido según el contexto del juego.
 * Soporta diferentes ambientes: combate, exploración, horror, traición, etc.
 */

export type MusicContext = 
  | 'menu' // Menú principal
  | 'exploration' // Exploración tranquila
  | 'combat' // Combate estándar
  | 'boss_fight' // Pelea contra boss
  | 'horror' // Momento de terror/suspenso
  | 'mystery' // Misterio/investigación
  | 'triumph' // Victoria/celebración
  | 'sadness' // Momento triste
  | 'betrayal' // Traición/revelación oscura
  | 'tavern' // Ambiente de taberna
  | 'dungeon'; // Exploración de dungeon

export type SoundEffect =
  // UI Sounds
  | 'ui_click'
  | 'ui_hover'
  | 'ui_open'
  | 'ui_close'
  | 'ui_error'
  
  // Combat Sounds
  | 'attack_sword'
  | 'attack_hit'
  | 'attack_miss'
  | 'attack_critical'
  | 'defend'
  | 'take_damage'
  | 'death'
  
  // Magic Sounds
  | 'spell_cast'
  | 'spell_hit'
  | 'heal'
  
  // Item Sounds
  | 'pickup_item'
  | 'equip_item'
  | 'use_potion'
  | 'drop_item'
  | 'coins'
  
  // Character Sounds
  | 'level_up'
  | 'quest_complete'
  | 'achievement'
  
  // Ambient Sounds
  | 'door_open'
  | 'door_close'
  | 'chest_open'
  | 'footsteps'
  | 'heartbeat';

interface AudioTrack {
  context: MusicContext;
  path: string;
  volume: number;
  loop: boolean;
}

interface SFXDefinition {
  path: string;
  volume: number;
}

/**
 * Servicio de Audio del Juego
 */
export class AudioService {
  private currentMusic: HTMLAudioElement | null = null;
  private currentContext: MusicContext | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private isMuted: boolean = false;
  private isEnabled: boolean = true;

  // Mapeo de contextos a archivos de música
  private musicTracks: Record<MusicContext, AudioTrack> = {
    menu: {
      context: 'menu',
      path: '/audio/music/menu_theme.mp3',
      volume: 0.4,
      loop: true,
    },
    exploration: {
      context: 'exploration',
      path: '/audio/music/exploration.mp3',
      volume: 0.3,
      loop: true,
    },
    combat: {
      context: 'combat',
      path: '/audio/music/combat.mp3',
      volume: 0.6,
      loop: true,
    },
    boss_fight: {
      context: 'boss_fight',
      path: '/audio/music/boss_fight.mp3',
      volume: 0.7,
      loop: true,
    },
    horror: {
      context: 'horror',
      path: '/audio/music/horror.mp3',
      volume: 0.5,
      loop: true,
    },
    mystery: {
      context: 'mystery',
      path: '/audio/music/mystery.mp3',
      volume: 0.4,
      loop: true,
    },
    triumph: {
      context: 'triumph',
      path: '/audio/music/triumph.mp3',
      volume: 0.6,
      loop: false,
    },
    sadness: {
      context: 'sadness',
      path: '/audio/music/sadness.mp3',
      volume: 0.3,
      loop: false,
    },
    betrayal: {
      context: 'betrayal',
      path: '/audio/music/betrayal.mp3',
      volume: 0.5,
      loop: false,
    },
    tavern: {
      context: 'tavern',
      path: '/audio/music/tavern.mp3',
      volume: 0.4,
      loop: true,
    },
    dungeon: {
      context: 'dungeon',
      path: '/audio/music/dungeon.mp3',
      volume: 0.4,
      loop: true,
    },
  };

  // Mapeo de efectos de sonido
  private sfxMap: Record<SoundEffect, SFXDefinition> = {
    // UI
    ui_click: { path: '/audio/sfx/ui_click.mp3', volume: 0.3 },
    ui_hover: { path: '/audio/sfx/ui_hover.mp3', volume: 0.2 },
    ui_open: { path: '/audio/sfx/ui_open.mp3', volume: 0.4 },
    ui_close: { path: '/audio/sfx/ui_close.mp3', volume: 0.4 },
    ui_error: { path: '/audio/sfx/ui_error.mp3', volume: 0.5 },
    
    // Combat
    attack_sword: { path: '/audio/sfx/attack_sword.mp3', volume: 0.6 },
    attack_hit: { path: '/audio/sfx/attack_hit.mp3', volume: 0.7 },
    attack_miss: { path: '/audio/sfx/attack_miss.mp3', volume: 0.4 },
    attack_critical: { path: '/audio/sfx/attack_critical.mp3', volume: 0.8 },
    defend: { path: '/audio/sfx/defend.mp3', volume: 0.5 },
    take_damage: { path: '/audio/sfx/take_damage.mp3', volume: 0.6 },
    death: { path: '/audio/sfx/death.mp3', volume: 0.7 },
    
    // Magic
    spell_cast: { path: '/audio/sfx/spell_cast.mp3', volume: 0.6 },
    spell_hit: { path: '/audio/sfx/spell_hit.mp3', volume: 0.7 },
    heal: { path: '/audio/sfx/heal.mp3', volume: 0.5 },
    
    // Items
    pickup_item: { path: '/audio/sfx/pickup_item.mp3', volume: 0.4 },
    equip_item: { path: '/audio/sfx/equip_item.mp3', volume: 0.5 },
    use_potion: { path: '/audio/sfx/use_potion.mp3', volume: 0.5 },
    drop_item: { path: '/audio/sfx/drop_item.mp3', volume: 0.4 },
    coins: { path: '/audio/sfx/coins.mp3', volume: 0.5 },
    
    // Character
    level_up: { path: '/audio/sfx/level_up.mp3', volume: 0.7 },
    quest_complete: { path: '/audio/sfx/quest_complete.mp3', volume: 0.7 },
    achievement: { path: '/audio/sfx/achievement.mp3', volume: 0.6 },
    
    // Ambient
    door_open: { path: '/audio/sfx/door_open.mp3', volume: 0.5 },
    door_close: { path: '/audio/sfx/door_close.mp3', volume: 0.5 },
    chest_open: { path: '/audio/sfx/chest_open.mp3', volume: 0.6 },
    footsteps: { path: '/audio/sfx/footsteps.mp3', volume: 0.3 },
    heartbeat: { path: '/audio/sfx/heartbeat.mp3', volume: 0.4 },
  };

  /**
   * Cambia la música según el contexto
   */
  async playMusic(context: MusicContext, fadeIn: boolean = true): Promise<void> {
    if (!this.isEnabled || this.isMuted) return;

    // Si ya está sonando esta música, no hacer nada
    if (this.currentContext === context && this.currentMusic) return;

    const track = this.musicTracks[context];
    if (!track) {
      console.warn(`Music track not found for context: ${context}`);
      return;
    }

    try {
      // Fade out música actual
      if (this.currentMusic) {
        await this.fadeOutMusic();
        this.currentMusic.pause();
        this.currentMusic = null;
      }

      // Cargar nueva música
      const audio = new Audio(track.path);
      audio.loop = track.loop;
      audio.volume = fadeIn ? 0 : track.volume * this.musicVolume;

      audio.addEventListener('error', (e) => {
        console.warn(`Could not load music: ${track.path}`, e);
      });

      try {
        await audio.play();
        this.currentMusic = audio;
        this.currentContext = context;

        // Fade in si está habilitado
        if (fadeIn) {
          await this.fadeInMusic(track.volume * this.musicVolume);
        }
      } catch (error) {
        console.warn('Error playing audio (user interaction may be required):', error);
      }
    } catch (error) {
      console.error(`Error loading music for context ${context}:`, error);
    }
  }

  /**
   * Reproduce un efecto de sonido
   */
  playSFX(effect: SoundEffect): void {
    if (!this.isEnabled || this.isMuted) return;

    const sfx = this.sfxMap[effect];
    if (!sfx) {
      console.warn(`Sound effect not found: ${effect}`);
      return;
    }

    try {
      const audio = new Audio(sfx.path);
      audio.volume = sfx.volume * this.sfxVolume;
      
      audio.addEventListener('error', () => {
        console.warn(`Could not load SFX: ${sfx.path}`);
      });

      audio.play().catch(() => {
        // Silently fail if user hasn't interacted yet
      });
    } catch (error) {
      console.warn(`Error playing SFX ${effect}:`, error);
    }
  }

  /**
   * Detiene la música actual
   */
  stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this.fadeOutMusic().then(() => {
        if (this.currentMusic) {
          this.currentMusic.pause();
          this.currentMusic = null;
          this.currentContext = null;
        }
      });
    } else {
      this.currentMusic.pause();
      this.currentMusic = null;
      this.currentContext = null;
    }
  }

  /**
   * Fade in de la música
   */
  private fadeInMusic(targetVolume: number, duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentMusic) {
        resolve();
        return;
      }

      const steps = 50;
      const stepTime = duration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        if (!this.currentMusic || this.isMuted) {
          clearInterval(interval);
          resolve();
          return;
        }

        currentStep++;
        this.currentMusic.volume = Math.min(volumeStep * currentStep, targetVolume);

        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Fade out de la música
   */
  private fadeOutMusic(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentMusic) {
        resolve();
        return;
      }

      const startVolume = this.currentMusic.volume;
      const steps = 50;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        if (!this.currentMusic) {
          clearInterval(interval);
          resolve();
          return;
        }

        currentStep++;
        this.currentMusic.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

        if (currentStep >= steps || this.currentMusic.volume === 0) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Establece el volumen de la música (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  /**
   * Establece el volumen de los efectos de sonido (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Silencia o activa todo el audio
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.currentMusic) {
      this.currentMusic.volume = muted ? 0 : this.musicVolume;
    }
  }

  /**
   * Habilita o deshabilita el sistema de audio
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.currentMusic) {
      this.stopMusic(false);
    }
  }

  /**
   * Obtiene el contexto musical actual
   */
  getCurrentContext(): MusicContext | null {
    return this.currentContext;
  }

  /**
   * Obtiene el volumen actual de la música
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Obtiene el volumen actual de los SFX
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Verifica si está silenciado
   */
  isMutedState(): boolean {
    return this.isMuted;
  }
}

// Instancia singleton
let audioServiceInstance: AudioService | null = null;

/**
 * Obtiene la instancia del servicio de audio
 */
export const getAudioService = (): AudioService => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
};

export default AudioService;
