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
        const title = new PIXI.Text('Cursor In Danger', { fontSize: 70, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 200;
        this.addToScene('main', title);

        const titleImage = new PIXI.Sprite.from('images/cursorMain.png');
        titleImage.x = -30;
        titleImage.y = 50;
        titleImage.width = 700;
        titleImage.height = 700;
        this.addToScene('main', titleImage);


        const startButton = createButton(300, 75, 'Start', 30, `images/playButton.png`, 40, 400, () => {
            this.GameScene();
        });
        this.addToScene('main', startButton);

        const instructionButton = createButton(300, 75, 'Instruction', 30, `images/instructions.png`, 40, 500, () => {
            this.InstructionScene();
        });
        this.addToScene('main', instructionButton);

        const settingsButton = createButton(300, 75, 'Settings', 30, `images/settings.png`, 40, 600, () => {
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

        let lives = 10;
        const livesText = new PIXI.Text(`Lives: ${lives}`, { fontSize: 20, fill: 'white' });
        livesText.x = this.app.screen.width - livesText.width - 20;
        livesText.y = 20;
        this.addToScene('game', livesText);

        let score = 0;
        const scoreText = new PIXI.Text(`Score: ${score}`, { fontSize: 20, fill: 'white' });
        scoreText.x = this.app.screen.width - scoreText.width - 125;
        scoreText.y = 20;
        this.addToScene('game', scoreText);

        const trashNames = ['PopUpAd', 'trash', 'trashcan', 'recycleBag', 'eatenApple', 'webCookie', 'deadFish'];
        const trashSprites = [];

        trashNames.forEach((trashName) => {
            const path = `./images/trash/${trashName}.png`;
            const trashSprite = PIXI.Sprite.from(path);

            if (trashName === 'PopUpAd') { trashSprite.scale.set(.3, .3); }
            if (trashName === 'trash') { trashSprite.scale.set(3, 3); }
            if (trashName === 'trashcan') { trashSprite.scale.set(3, 3); }
            if (trashName === 'recycleBag') { trashSprite.scale.set(.1, .1); }
            if (trashName === 'eatenApple') { trashSprite.scale.set(.25, .25); }
            if (trashName === 'webCookie') { trashSprite.scale.set(.25, .25); }
            if (trashName === 'deadFish') { trashSprite.scale.set(.1, .1); }

            trashSprite.visible = false;
            trashSprites.push(trashSprite);

            this.addToScene('game', trashSprite);
        });

        const ticker = new PIXI.Ticker();
        ticker.add(() => {
            trashSprites.forEach((trashSprite) => {
                if (trashSprite.visible) {
                    trashSprite.x -= 2;
                    trashSprite.anchor.set(.5, .5);
                    trashSprite.rotation -= .05;

                    if (trashSprite.x + trashSprite.width < 0) {
                        trashSprite.x = this.app.screen.width;
                        trashSprite.y = Math.random() * (this.app.screen.height - trashSprite.height);

                        score++;
                        scoreText.text = `Score: ${score}`;
                    }

                    const mousePosition = this.app.renderer.plugins.interaction.mouse.global;
                    if (this.hitTestRectangle(mousePosition, trashSprite)) {
                        trashSprite.visible = false;
                        lives--;
                        livesText.text = `Lives: ${lives}`;

                        if (lives == 0) {
                            this.GameOverScene();
                        }
                    }
                } else {
                    if (Math.random() < 0.015) {
                        trashSprite.visible = true;
                        trashSprite.x = this.app.screen.width;
                        trashSprite.y = Math.random() * (this.app.screen.height - trashSprite.height);
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
        }, 20);
        this.addToScene('gameOver', backButton);

        const text = new PIXI.Text('Game Over', { fontSize: 100, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        text.x = this.app.screen.width / 2 - text.width / 2;
        text.y = this.app.screen.height / 2 - text.height / 2;
        this.addToScene('gameOver', text);

        this.switchToScene('gameOver');
    }

    InstructionScene() {
        const backButton = createButton(40, 40, '', 20, `images/WhiteHomeIcon.png`, 20, 20, () => {
            this.MainScene();
        }, 20);
        this.addToScene('instruction', backButton);

        const text = new PIXI.Text('Dodge To Victory', { fontSize: 110, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        text.x = this.app.screen.width / 2 - text.width / 2;
        text.y = 180;
        this.addToScene('instruction', text);

        const text1 = new PIXI.Text('Move the Mouse to Avoid the Garbage!', { fontSize: 50, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        text1.x = this.app.screen.width / 2 - text1.width / 2;
        text1.y = 380;
        this.addToScene('instruction', text1);

        const text2 = new PIXI.Text('You can take 10 hits before its game over!', { fontSize: 50, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        text2.x = this.app.screen.width / 2 - text2.width / 2;
        text2.y = 460;
        this.addToScene('instruction', text2);

        this.switchToScene('instruction');
    }

    SettingsScene() {
        const backButton = createButton(40, 40, '', 20, `images/WhiteHomeIcon.png`, 20, 20, () => {
            this.MainScene();
        }, 20);
        this.addToScene('settings', backButton);

        const text1 = new PIXI.Text('Adjust Audio', { fontSize: 50, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
        text1.x = this.app.screen.width / 2 - text1.width / 2;
        text1.y = 250;
        this.addToScene('settings', text1);

        //Add Audio Muting/Volume change

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

/*
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
*/

function createButton(buttonWidth, buttonHeight, text, textSize, iconPath, iconSize, y, onClick, x = null) {
    const button = new PIXI.Container();

    const buttonBg = new PIXI.Sprite(PIXI.Texture.WHITE);
    buttonBg.width = buttonWidth;
    buttonBg.height = buttonHeight;
    buttonBg.tint = 0x555555;
    button.addChild(buttonBg);

    const buttonText = new PIXI.Text(text, { fontSize: textSize, fill: 'white', fontFamily: ['Nova Square', 'sans-serif'] });
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