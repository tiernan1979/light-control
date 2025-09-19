// custom-light-control-card.js
// Place this file in <config>/www/custom-light-control-card.js
// Then add to resources in Lovelace configuration: url: /local/custom-light-control-card.js type: module
// For HACS: Create a GitHub repo with this file, add as custom repository in HACS under Frontend.

// Usage in Lovelace YAML:
// type: custom:light-control-card
// groups:
//   - name: Living Room
//     group_entity: light.living_room_group
//     lights:
//       - entity: light.lifx1
//         name: LIFX Lamp 1
//       - entity: light.lifx2
//         name: LIFX Lamp 2
//       - entity: light.other
//         name: Other Lamp
//   - name: Kitchen
//     group_entity: light.kitchen_group
//     lights: [...]
// scenes:
//   - entity: scene.relax
//     name: Relax
//     icon: mdi:sofa
//   - entity: scene.bright
//     name: Bright
//     icon: mdi:weather-sunny

import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.2?module';

class LightControlCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    if (!config.groups || !Array.isArray(config.groups)) {
      throw new Error('You need to define groups as an array');
    }
    if (!config.scenes || !Array.isArray(config.scenes)) {
      throw new Error('You need to define scenes as an array');
    }
    this.config = config;
  }

  render() {
    return html`
      <ha-card>
        <div class="title">Scenes</div>
        <div class="scenes">
          ${this.config.scenes.map(scene => html`
            <ha-chip
              .hasIcon=${scene.icon ? true : false}
              @click=${() => this._activateScene(scene.entity)}>
              ${scene.icon ? html`<ha-icon icon="${scene.icon}"></ha-icon>` : ''}
              ${scene.name || scene.entity.split('.')[1].replace(/_/g, ' ')}
            </ha-chip>
          `)}
        </div>

        <div class="title">Light Groups</div>
        ${this.config.groups.map(group => {
          const groupState = this.hass.states[group.group_entity];
          return html`
            <details>
              <summary>
                <div class="group-header">
                  <ha-icon icon="mdi:lightbulb-group"></ha-icon>
                  <span>${group.name}</span>
                  <ha-switch
                    .checked=${groupState && groupState.state === 'on'}
                    @change=${ev => this._toggle(group.group_entity, ev.target.checked)}>
                  </ha-switch>
                </div>
                ${groupState && groupState.state === 'on' ? html`
                  <ha-slider
                    .value=${Math.round((groupState.attributes.brightness || 0) / 2.55)}
                    @change=${ev => this._setBrightness(group.group_entity, ev.target.value)}
                    min="0" max="100" step="1">
                  </ha-slider>
                  ${groupState.attributes.supported_color_modes && groupState.attributes.supported_color_modes.includes('rgb') ? html`
                    <ha-color-picker
                      .value=${groupState.attributes.rgb_color ? `rgb(${groupState.attributes.rgb_color.join(',')})` : '#ffffff'}
                      @value-changed=${ev => this._setColor(group.group_entity, ev.detail.value)}>
                    </ha-color-picker>
                  ` : ''}
                ` : ''}
              </summary>
              ${group.lights.map(light => {
                const lightState = this.hass.states[light.entity];
                const isLifx = lightState && lightState.attributes.effect_list && lightState.attributes.effect_list.length > 0; // Assume LIFX has effects
                return html`
                  <div class="light-item">
                    <ha-icon icon="mdi:lightbulb"></ha-icon>
                    <span>${light.name || light.entity.split('.')[1].replace(/_/g, ' ')}</span>
                    <ha-switch
                      .checked=${lightState && lightState.state === 'on'}
                      @change=${ev => this._toggle(light.entity, ev.target.checked)}>
                    </ha-switch>
                    ${lightState && lightState.state === 'on' ? html`
                      <ha-slider
                        .value=${Math.round((lightState.attributes.brightness || 0) / 2.55)}
                        @change=${ev => this._setBrightness(light.entity, ev.target.value)}
                        min="0" max="100" step="1">
                      </ha-slider>
                      ${lightState.attributes.supported_color_modes && lightState.attributes.supported_color_modes.includes('rgb') ? html`
                        <ha-color-picker
                          .value=${lightState.attributes.rgb_color ? `rgb(${lightState.attributes.rgb_color.join(',')})` : '#ffffff'}
                          @value-changed=${ev => this._setColor(light.entity, ev.detail.value)}>
                        </ha-color-picker>
                      ` : ''}
                      ${isLifx && lightState.attributes.effect_list ? html`
                        <ha-select
                          .value=${lightState.attributes.effect || ''}
                          @selected=${ev => this._setEffect(light.entity, ev.target.value)}>
                          <mwc-list-item value=""></mwc-list-item>
                          ${lightState.attributes.effect_list.map(effect => html`
                            <mwc-list-item value="${effect}">${effect}</mwc-list-item>
                          `)}
                        </ha-select>
                      ` : ''}
                    ` : ''}
                  </div>
                `;
              })}
            </details>
          `;
        })}
      </ha-card>
    `;
  }

  _toggle(entity, isOn) {
    this.hass.callService('light', isOn ? 'turn_on' : 'turn_off', { entity_id: entity });
  }

  _setBrightness(entity, value) {
    this.hass.callService('light', 'turn_on', { entity_id: entity, brightness_pct: value });
  }

  _setColor(entity, color) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    this.hass.callService('light', 'turn_on', { entity_id: entity, rgb_color: [r, g, b] });
  }

  _setEffect(entity, effect) {
    this.hass.callService('light', 'turn_on', { entity_id: entity, effect });
  }

  _activateScene(entity) {
    this.hass.callService('scene', 'turn_on', { entity_id: entity });
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        background-color: var(--ha-card-background, white);
        box-shadow: var(--ha-card-box-shadow, none);
        border-radius: var(--ha-card-border-radius, 12px);
      }
      .title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .scenes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 16px;
      }
      ha-chip {
        cursor: pointer;
      }
      details {
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }
      summary {
        padding: 8px;
        background-color: var(--primary-background-color);
        display: flex;
        flex-direction: column;
      }
      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .light-item {
        padding: 8px;
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--divider-color);
      }
      ha-slider {
        width: 100%;
      }
      ha-color-picker {
        width: 100%;
      }
      ha-select {
        width: 100%;
      }
    `;
  }

  getCardSize() {
    return 4; // Adjust based on expected size
  }
}

customElements.define('light-control-card', LightControlCard);
