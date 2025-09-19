import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.2?module';

class LightControlCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      expandedGroups: { type: Object },
    };
  }

  constructor() {
    super();
    this.expandedGroups = {};
  }

  setConfig(config) {
    if (!config.groups || !Array.isArray(config.groups)) {
      throw new Error('You need to define groups as an array');
    }
    if (config.scenes && !Array.isArray(config.scenes)) {
      throw new Error('Scenes must be an array');
    }
    this.config = {
      ...config,
      scenes: config.scenes || [], // Default to empty array if scenes not provided
    };
  }

  _friendlyName(entity) {
    return entity.split('.')[1].replace(/_/g, ' ');
  }

  _brightnessValue(state) {
    return state.state === 'on' ? Math.round((state.attributes.brightness || 0) / 2.55) : 0;
  }

  _rgbColor(rgb) {
    return rgb ? `rgb(${rgb.join(',')})` : '#ffffff';
  }

  render() {
    return html`
      <ha-card>
        ${this.config.scenes.length > 0 ? html`
          <div class="button-container">
            ${this.config.scenes.map(scene => html`
              <button
                class="scene-button"
                @click=${() => this._activateScene(scene.entity)}
              >
                ${scene.icon ? html`<ha-icon icon="${scene.icon}"></ha-icon>` : ''}
                ${scene.name || this._friendlyName(scene.entity)}
              </button>
            `)}
          </div>
        ` : ''}

        <div class="group-container">
          ${this.config.groups.map((group, index) => {
            const groupState = this.hass.states[group.group_entity];
            const isExpanded = this.expandedGroups[index] || false;
            return html`
              <div class="group-header" @click=${() => this._toggleGroup(index)}>
                <ha-icon icon="mdi:lightbulb-group"></ha-icon>
                <span>${group.name}</span>
                <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
              </div>
              ${groupState ? html`
                <div class="group-controls">
                  <div class="slider-container">
                    <input
                      type="range"
                      class="custom-slider"
                      .value=${this._brightnessValue(groupState)}
                      @click=${() => this._toggleSlider(group.group_entity, groupState.state)}
                      @input=${(ev) => this._setBrightness(group.group_entity, ev.target.value)}
                      min="0"
                      max="100"
                      step="1"
                    >
                  </div>
                  ${groupState.attributes.supported_color_modes?.includes('rgb') ? html`
                    <div
                      class="color-indicator"
                      style=${`background-color: ${this._rgbColor(groupState.attributes.rgb_color)}`}
                      @dblclick=${() => this._openColorPicker(group.group_entity, groupState.attributes.rgb_color || [255, 255, 255])}
                    ></div>
                  ` : ''}
                </div>
              ` : ''}
              ${isExpanded ? html`
                <div class="light-list">
                  ${group.lights.map(light => {
                    const lightState = this.hass.states[light.entity];
                    const isLifx = lightState && lightState.attributes.effect_list && lightState.attributes.effect_list.length > 0;
                    return lightState ? html`
                      <div class="light-item">
                        <span>${light.name || this._friendlyName(light.entity)}</span>
                        <div class="slider-container">
                          <input
                            type="range"
                            class="custom-slider"
                            .value=${this._brightnessValue(lightState)}
                            @click=${() => this._toggleSlider(light.entity, lightState.state)}
                            @input=${(ev) => this._setBrightness(light.entity, ev.target.value)}
                            min="0"
                            max="100"
                            step="1"
                          >
                        </div>
                        ${lightState.attributes.supported_color_modes?.includes('rgb') ? html`
                          <div
                            class="color-indicator"
                            style=${`background-color: ${this._rgbColor(lightState.attributes.rgb_color)}`}
                            @dblclick=${() => this._openColorPicker(light.entity, lightState.attributes.rgb_color || [255, 255, 255])}
                          ></div>
                        ` : ''}
                        ${isLifx && lightState.state === 'on' ? html`
                          <div class="effects-container">
                            ${lightState.attributes.effect_list.map(effect => html`
                              <button
                                class="effect-button ${lightState.attributes.effect === effect ? 'active' : ''}"
                                @click=${() => this._setEffect(light.entity, effect)}
                              >
                                ${effect}
                              </button>
                            `)}
                          </div>
                        ` : ''}
                      </div>
                    ` : ''})
                  })}
                </div>
              ` : ''}
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  _toggleGroup(index) {
    this.expandedGroups = { ...this.expandedGroups, [index]: !this.expandedGroups[index] };
    this.requestUpdate();
  }

  _toggleSlider(entity, state) {
    this.hass.callService('light', state === 'on' ? 'turn_off' : 'turn_on', { entity_id: entity });
  }

  _setBrightness(entity, value) {
    if (value > 0) {
      this.hass.callService('light', 'turn_on', { entity_id: entity, brightness_pct: value });
    } else {
      this.hass.callService('light', 'turn_off', { entity_id: entity });
    }
  }

  _setEffect(entity, effect) {
    this.hass.callService('light', 'turn_on', { entity_id: entity, effect });
  }

  _openColorPicker(entity, rgbColor) {
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId: entity },
    });
    this.dispatchEvent(event);
    setTimeout(() => {
      const moreInfo = document.querySelector('home-assistant')?.shadowRoot?.querySelector('ha-more-info-dialog');
      if (moreInfo) {
        moreInfo.shadowRoot.querySelector('ha-dialog').scrollTop = 0;
      }
    }, 100);
  }

  _activateScene(entity) {
    this.hass.callService('scene', 'turn_on', { entity_id: entity });
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        background-color: var(--ha-card-background, white);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        border-radius: var(--ha-card-border-radius, 12px);
      }
      .button-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 16px;
      }
      .scene-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
      }
      .scene-button:hover {
        background-color: var(--accent-color);
      }
      .group-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background-color: var(--primary-background-color);
        border-radius: 8px;
        cursor: pointer;
      }
      .group-controls {
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .light-list {
        padding: 0 16px;
      }
      .light-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
        border-top: 1px solid var(--divider-color);
      }
      .slider-container {
        flex: 1;
        position: relative;
      }
      .custom-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) 100%);
        -webkit-appearance: none;
        outline: none;
        cursor: pointer;
      }
      .custom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        border: 2px solid var(--primary-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      }
      .custom-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        border: 2px solid var(--primary-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      }
      .color-indicator {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--divider-color);
        cursor: pointer;
      }
      .effects-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        justify-content: center;
      }
      .effect-button {
        padding: 4px 8px;
        background-color: var(--secondary-background-color, #f0f0f0);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      }
      .effect-button:hover {
        background-color: var(--accent-color);
      }
      .effect-button.active {
        background-color: var(--primary-color);
        color: white;
      }
    `;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('light-control-card', LightControlCard);
