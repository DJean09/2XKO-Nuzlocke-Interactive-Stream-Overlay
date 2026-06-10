# 2XKO Nuzlocke Interactive Stream Overlay

A real-time, modular broadcast overlay designed for a 2XKO Nuzlocke series. This project features a split-widget front-end optimized for OBS Studio and an AWS serverless backend to track run states (champion deaths, fuse inventory) across streams.

## Architecture

This project is decoupled into two main components:
1. **The Display Widgets (Front-End):** Custom HTML/CSS/JS files designed as transparent, independent browser sources for OBS. They use a split architecture (`champions.html` and `fuses.html`) to allow flexible repositioning around the 2XKO game UI without rigid 16:9 canvas constraints.
2. **The State Tracker (Cloud Backend):** A serverless infrastructure using **Amazon API Gateway**, **AWS Lambda** (Python), and **Amazon DynamoDB** to persistently store the Nuzlocke state and prevent data desync in the event of local software crashes.

## Current Status: Local Testing Mode

The overlay is currently in an active development phase and is **toggled for local use**. 

Currently, state changes (killing/reviving champions or updating fuse counts) are triggered manually via the OBS "Interact" window. The JavaScript handles the DOM manipulation directly without requiring the live AWS routing.

## Roadmap: Live Broadcast Integration

The next phase of development will shift the local-click triggers to automated, viewer-driven events. Planned integrations include:
* **Streamer.bot / Twitch Channel Points:** Wiring Twitch reward redemptions to fire JSON payloads directly to the AWS API Gateway endpoint.
* **WebSocket Real-Time Updates:** Replacing local DOM updates with an AWS API Gateway WebSocket connection, allowing the cloud database to push state changes down to OBS instantly.
* **Twitch EventSub (Optional):** Bypassing local middleware entirely by establishing a direct webhook handshake between Twitch and AWS Lambda.

## Local Setup & Usage

To test the widgets locally in OBS:

1. Clone this repository to your streaming PC.
2. Open OBS Studio and create a new **Browser Source**.
3. Check the **Local file** box and point it to `champions.html` (Width: 600, Height: 200).
4. Create a second Browser Source, check **Local file**, and point it to `fuses.html` (Width: 600, Height: 200).
5. Drag and position the widgets around your game capture. 
6. Right-click either source in OBS and select **Interact** to manually toggle champion states or adjust fuse counts.

> **Note:** If adjusting the CSS styling, you must use the `Refresh cache of current page` button in the OBS source properties to see local changes applied.
