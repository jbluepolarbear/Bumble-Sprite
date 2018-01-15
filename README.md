# Bumble-Sprite
Sprite class with hierarchy built on top of Bumble
<p align="center">
  <img src="https://raw.githubusercontent.com/jbluepolarbear/Bumble/master/bumble.png"/>
</p>

## Road Map
* Sprite:
    * Input Blocking
    * Clipping
    * Button
    * Text Box
    * Scroll list


## Sample Usage
```javascript
// create bumble instance
const bumble = new Bumble('sample', 720, 480, 'black', 60);
// can get and set gamestate that is saved in localStorage

bumble.preloader.loadAll([
    new BumbleResource('smoke', 'img/smoke.png', 'image'),
    new BumbleResource('smoke_fire', 'img/smoke_fire.png', 'image'),
]);

bumble.runCoroutine(function *() {
    const rootSprite = new BumbleSprite(bumble, bumble.width, bumble.height);
    rootSprite.color = 'red';
    rootSprite.debugDraw = false;
    rootSprite.position = new BumbleVector(bumble.width / 2.0, bumble.height / 2.0);

    const sprite2 = new BumbleSprite(bumble, 50, 50);
    rootSprite.addChild(sprite2);
    sprite2.position = new BumbleVector(bumble.width / 2, bumble.height / 2);
    sprite2.debugDraw = true;
    sprite2.color = BumbleColor.fromRGB(255, 0, 255);

    const emitter = new BumbleParticleEmitter(bumble, 20, 0.05, (getParticleFunc) => {
        let particle = getParticleFunc();
        if (particle != null) {
            bumble.runCoroutine(function *() {
                particle.rotation = BumbleUtility.randomFloat(Math.PI * 2.0);
                const direction = BumbleUtility.randomFloat(-Math.PI / 3) + -Math.PI / 3;
                const speed = BumbleUtility.randomFloat(10) + 25;
                const velocity = new BumbleVector(Math.cos(direction) * speed, Math.sin(direction) * speed);
                const life = BumbleUtility.randomFloat(5) + 1;
                let startTime = bumble.gameTime;
                while (bumble.gameTime - startTime < life) {
                    particle.opacity = 1.0 - (bumble.gameTime - startTime) / life;
                    particle.position = particle.position.add(velocity.multiplyValue(bumble.deltaTime));
                    yield;
                }
                particle.opacity = 0.0;
                particle.alive = false;
            });
        }
    }, () => {
        if (Math.random() < 0.25) {
            return new BumbleParticle(bumble, 25, 25, bumble.getImage('smoke_fire'));
        } else {
            return new BumbleParticle(bumble, 35, 35, bumble.getImage('smoke'));
        }
    }, 1000);

    emitter.position = new BumbleVector(rootSprite.width / 2, rootSprite.height / 2);
    rootSprite.addChild(emitter);
    emitter.start();
    bumble.debug.showFramerate = true;

    while (!bumble.keys.isDown(BumbleKeyCodes.R) && !bumble.mouse.mouseState.buttonState[2]) {
        bumble.clearScreen();
        rootSprite.draw();
        if (bumble.keys.isDown(BumbleKeyCodes.SPACE)) {
            emitter.emit();
        }
        yield;
    }
});
```
