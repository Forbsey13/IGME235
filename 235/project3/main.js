"use strict";
const app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
document.body.appendChild(app.view);

window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

class SceneManaging {
    constructor(app) {
        this.app = app;
        this.scenes = {
            main: new PIXI.Container(),
            game: new PIXI.Container(),
            gameOver: new PIXI.Container(),
            shop: new PIXI.Container(),
            instruction: new PIXI.Container(),
            settings: new PIXI.Container(),
        };

        this.currentScene = null;
        this.Scenes();

        this.trailGraphics = new PIXI.Graphics();
        this.app.stage.addChild(this.trailGraphics);
    }

    Scenes() {
        for (const sceneKey in this.scenes) {
            this.app.stage.addChild(this.scenes[sceneKey]);
            this.scenes[sceneKey].visible = false;
        }
    }

    switchToScene(sceneKey) {
        const scene = this.scenes[sceneKey];
        if (scene && scene !== this.currentScene) {
            if (this.currentScene) {
                this.currentScene.visible = false;
            }
            scene.visible = true;
            this.currentScene = scene;
        }
    }

    addToScene(sceneKey, element) {
        const scene = this.scenes[sceneKey];
        if (scene) {
            scene.addChild(element);
        }
    }

    MainScene() {
        const title = new PIXI.Text('Cursor In Danger', { fontSize: 70, fill: 'white' });
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 200;
        this.addToScene('main', title);

        const startButton = createButton(300, 75, 'Start', 30, `./media/icons/Play.png`, 40, 400, () => {
            this.GameScene();
        });
        this.addToScene('main', startButton);

        const instructionButton = createButton(300, 75, 'Instruction', 30, `./media/icons/Instruction.png`, 40, 500, () => {
            this.InstructionScene();
        });
        this.addToScene('main', instructionButton);

        const settingsButton = createButton(300, 75, 'Settings', 30, `./media/icons/Gear.png`, 40, 600, () => {
            this.SettingsScene();
        });
        this.addToScene('main', settingsButton);



        this.switchToScene('main');
    }

    GameScene() {
        const backButton = createButton(50, 50, '', 20, `images/WhiteHomeIcon.png`, 30, 25, () => {
            this.MainScene();
        }, 20, 'true');
        this.addToScene('game', backButton);

        let score = 0;
        const scoreText = new PIXI.Text(`Score: ${score}`, { fontSize: 20, fill: 'white' });
        scoreText.x = this.app.screen.width - scoreText.width - 20;
        scoreText.y = 20;
        this.addToScene('game', scoreText);

        const fruitNames = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry', 'Watermelon'];
        const fruitSprites = [];

        fruitNames.forEach((fruitName) => {
            const path = `./media/fruits/${fruitName}.png`;
            const fruitSprite = PIXI.Sprite.from(path);

            if (fruitName === 'Watermelon') { fruitSprite.scale.set(2, 2); }

            fruitSprite.visible = false;
            fruitSprites.push(fruitSprite);

            this.addToScene('game', fruitSprite);
        });

        const ticker = new PIXI.Ticker();
        ticker.add(() => {
            fruitSprites.forEach((fruitSprite) => {
                if (fruitSprite.visible) {
                    fruitSprite.y += 2;

                    if (fruitSprite.y > this.app.screen.height) {
                        fruitSprite.y = -fruitSprite.height;
                        fruitSprite.x = Math.random() * (this.app.screen.width - fruitSprite.width);
                    }

                    const mousePosition = this.app.renderer.plugins.interaction.mouse.global;
                    if (this.hitTestRectangle(mousePosition, fruitSprite)) {
                        fruitSprite.visible = false;
                        score += 10;
                        scoreText.text = `Score: ${score}`;
                    }
                } else {
                    if (Math.random() < 0.02) {
                        fruitSprite.visible = true;
                        fruitSprite.x = Math.random() * (this.app.screen.width - fruitSprite.width);
                    }
                }
            });
        });

        ticker.start();
        this.switchToScene('game');
    }

    GameOverScene() {
        const backButton = createButton(40, 40, '', 20, `images/WhiteHomeIcon.png`, 20, 20, () => {
            this.MainScene();
        }, 20, 'true');
        this.addToScene('gameOver', backButton);

        // Retry and Main Menu buttons
        // Display the score

        this.switchToScene('gameOver');
    }

    InstructionScene() {
        const backButton = createButton(40, 40, '', 20, `images/WhiteHomeIcon.png`, 20, 20, () => {
            this.MainScene();
        }, 20, 'true');
        this.addToScene('instruction', backButton);

        const text = new PIXI.Text('How to Play', { fontSize: 50, fill: 'white' });
        text.x = this.app.screen.width / 2 - text.width / 2;
        text.y = 200;
        this.addToScene('instruction', text);

        this.switchToScene('instruction');
    }

    SettingsScene() {
        const backButton = createButton(40, 40, '', 20, `images/WhiteHomeIcon.png`, 20, 20, () => {
            this.MainScene();
        }, 20, 'true');
        this.addToScene('settings', backButton);

        this.switchToScene('settings');
    }

    hitTestRectangle(point, sprite) {
        return (
            point.x > sprite.x &&
            point.x < sprite.x + sprite.width &&
            point.y > sprite.y &&
            point.y < sprite.y + sprite.height
        );
    }
}

const sceneManaging = new SceneManaging(app);
sceneManaging.MainScene();

playBackgroundMusic();

async function playBackgroundMusic() {
    try {
        const backgroundMusic = new Howl({
            src: ['./media/audio/main_bgm.mp3'],
            loop: true,
            volume: 0.5,
        });
        await backgroundMusic.play();
    } catch (error) {
        console.error('Error playing background music:', error.message);
    }
}

function createButton(buttonWidth, buttonHeight, text, textSize, iconPath, iconSize, y, onClick, x = null, isBackButton) {
    const button = new PIXI.Container();

    const buttonBg = new PIXI.Sprite(PIXI.Texture.WHITE);
    buttonBg.width = buttonWidth;
    buttonBg.height = buttonHeight;
    buttonBg.tint = 0x555555;
    button.addChild(buttonBg);

    const buttonText = new PIXI.Text(text, { fontSize: textSize, fill: 'white' });
    buttonText.x = buttonBg.width / 2 - buttonText.width / 2;
    buttonText.y = buttonBg.height / 2 - buttonText.height / 2;
    button.addChild(buttonText);

    const icon = new PIXI.Sprite.from(iconPath);
    icon.width = iconSize;
    icon.height = iconSize;
    icon.x = 10;
    icon.y = buttonBg.height / 2 - icon.height / 2;
    button.addChild(icon);

    button.x = x !== null ? x : (app.screen.width - buttonBg.width) / 2;
    button.y = y;

    button.interactive = true;
    button.buttonMode = true;

    button.on('pointerover', () => { buttonBg.tint = 0x777777; });
    button.on('pointerout', () => { buttonBg.tint = 0x555555; });
    button.on('pointerdown', onClick);

    return button;
}