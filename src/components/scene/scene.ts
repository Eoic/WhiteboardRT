import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { Selector } from '../selector/selector.ts';
import { WORLD_BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants.ts';

export class Scene {
    private _viewport!: Viewport;
    private _selector!: Selector;
    private _app!: PIXI.Application<PIXI.Renderer>;

    constructor() {
        this.setupScene()
            .catch((error) => console.error(error));
    }

    private async setupScene() {
        this._app = await this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._selector = new Selector();
        this._app.stage.addChild(this._selector);
        this.setupEvents();
    }

    private async setupApp(container: HTMLElement): Promise<PIXI.Application<PIXI.Renderer>> {
        const app = new PIXI.Application();

        await app.init({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: WORLD_BACKGROUND_COLOR,
            resolution: 2,
        });

        container.appendChild(app.canvas);

        return app;
    }

    private setupViewport(app: PIXI.Application): Viewport {
        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_WIDTH,
            worldHeight: WORLD_HEIGHT,
            events: app.renderer.events,
            disableOnContextMenu: true,
        });

        app.stage.addChild(viewport);

        viewport
            .drag({ mouseButtons: 'middle-right' })
            .pinch()
            .wheel()
            .clampZoom({
                minScale: 0.15,
                maxScale: 12.50,
            });

        viewport.fit();
        viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

        // Example object.
        const graphics = new PIXI.Graphics();

        graphics.rect(50, 50, 100, 100);
        graphics.fill(0xde3249);
        viewport.addChild(graphics);
        // ---

        return viewport;
    }

    private setupEvents() {
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.canvas.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.canvas.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.canvas.addEventListener('pointerup', this.handleAppPointerUp);
    }

    /**
     * Make selection box active and initiate selection rectangle drawing.
     */
    private handleAppPointerDown = (event: PointerEvent) => {
        if (/*!this._puzzle || this._puzzle.dragPiece || */event.button !== 0)
            return;

        // this._puzzle.calculateBounds();
        this._selector.beginSelect(new PIXI.Point(event.clientX, event.clientY), new Map());
    };

    /**
     * Perform selecting with the selection box rectangle on mouse movement.
     */
    private handleAppPointerMove = (event: PointerEvent) => {
        if (!this._selector.isActive)
            return;

        this._selector.select(new PIXI.Point(event.clientX, event.clientY));
    };

    /**
     * End selection by the selection box if it was activated.
     */
    private handleAppPointerUp = (_event: PointerEvent) => {
        if (this._selector.isActive)
            this._selector.endSelect();
    };

    /**
     * Update the app and the viewport when window is resized.
     */
    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
    };

    /**
     * Disable middle mouse click scrolling.
     */
    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    };
}
