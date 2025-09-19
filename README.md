Lovelace Light Control Card
A modern, customizable Lovelace card for Home Assistant to control lights, light groups, and scenes. Features include brightness sliders, color pickers for RGB-capable lights, LIFX effect/theme support, and collapsible group layouts. Designed for visual editing in Home Assistant's Lovelace UI and distributed via Git for easy HACS integration.
Features

Scenes: Clickable chip buttons for quick scene activation.
Light Groups: Collapsible sections with group-level toggle, brightness slider, and color picker (if supported).
Individual Lights: Toggle, brightness slider, color picker (if supported), and LIFX-specific effect/theme dropdown.
Styling: Trendy, clean design using Home Assistant theme variables.
Editable: Configurable via Lovelace YAML or Home Assistant's visual editor.

Installation
Prerequisites

Home Assistant 2023.10.0 or later.
HACS installed for custom component management.
Lovelace UI configured in Home Assistant.

Install via HACS

Open HACS in Home Assistant.
Go to Frontend > Click + Explore & Download Repositories.
Add a custom repository:
URL: https://github.com/yourusername/lovelace-light-control-card
Category: Lovelace


Search for Lovelace Light Control Card and click Download.
Restart Home Assistant after installation.

Manual Installation

Clone or download the repository:git clone https://github.com/yourusername/lovelace-light-control-card.git


Copy light-control-card.js to <config>/www/light-control-card.js.
Add the resource to Lovelace:
Go to Configuration > Lovelace Dashboards > Resources > Add Resource.
Set:
URL: /local/light-control-card.js
Type: module


Save.


Restart Home Assistant.

Configuration
Add the card to your Lovelace dashboard via YAML or the visual editor. Example YAML:
type: custom:light-control-card
groups:
  - name: Living Room
    group_entity: light.living_room_group
    lights:
      - entity: light.lifx1
        name: LIFX Lamp 1
      - entity: light.lifx2
        name: LIFX Lamp 2
      - entity: light.other
        name: Other Lamp
  - name: Kitchen
    group_entity: light.kitchen_group
    lights:
      - entity: light.kitchen_light
        name: Kitchen Light
scenes:
  - entity: scene.relax
    name: Relax
    icon: mdi:sofa
  - entity: scene.bright
    name: Bright
    icon: mdi:weather-sunny
  - entity: scene.movie_night
    name: Movie Night
    icon: mdi:filmstrip

Configuration Options



Key
Description
Type
Required



groups
List of light groups
Array
Yes


groups[].name
Display name for the group
String
Yes


groups[].group_entity
Light group entity ID (e.g., light.living_room_group)
String
Yes


groups[].lights
List of individual lights
Array
Yes


groups[].lights[].entity
Light entity ID (e.g., light.lifx1)
String
Yes


groups[].lights[].name
Optional display name for the light
String
No


scenes
List of scenes
Array
Yes


scenes[].entity
Scene entity ID (e.g., scene.relax)
String
Yes


scenes[].name
Optional display name for the scene
String
No


scenes[].icon
Optional Material Design Icon (e.g., mdi:sofa)
String
No


Visual Editor

Add the card in Lovelace UI: Select Custom: Light Control Card.
Edit the YAML directly or use the visual editor to adjust groups and scenes.
Save and reposition as needed.

Styling
The card uses Home Assistant theme variables for a modern look. Customize with card-mod (requires the card-mod component):
type: custom:light-control-card
card_mod:
  style: |
    ha-card {
      --ha-card-background: rgba(255, 255, 255, 0.9);
      --ha-card-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

Contributing
Contributions are welcome! Follow these steps:

Fork the repository:git clone https://github.com/yourusername/lovelace-light-control-card.git
cd lovelace-light-control-card


Create a feature branch:git checkout -b feature/your-feature


Make changes and test locally (place light-control-card.js in <config>/www/ and add as a resource).
Commit changes:git commit -m "Add your feature description"


Push to your fork:git push origin feature/your-feature


Open a pull request on GitHub.

Development

Dependencies: Uses Lit for reactive UI. Install via npm for development:npm install


Testing: Place light-control-card.js in <config>/www/ and add as a resource (/local/light-control-card.js).
Building: No build step required; the card is a single JavaScript file.

Troubleshooting

Card not appearing? Ensure the resource URL is correct and the file is in /hacsfiles/ or /local/.
LIFX effects missing? Verify the light entity has effect_list in its attributes.
Errors? Check the browser console and Home Assistant logs.

License
MIT License
