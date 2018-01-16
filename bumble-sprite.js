class BumbleSprite {
    constructor(bumble, width, height) {
        this.__bumble = bumble;
        this.__transformation = new BumbleTransformation(this.__bumble, width, height);
        this.__children = [];
        this.__parent = null;
        this.__debugDraw = false;
        this.__color = BumbleColor.fromRGB(255, 255, 255);
        this.__opacity = 1.0;
    }

    get width() {
        return this.__transformation.width;
    }

    get height() {
        return this.__transformation.height;
    }
    
    setSize(width, height) {
        this.__transformation.width = width;
        this.__transformation.height = height;
    }

    get debugDraw() { return this.__debugDraw; }
    set debugDraw(value) {
        this.__debugDraw = value;
    }

    get color() { return this.__color; }
    set color(value) {
        this.__color = value;
    }

    get opacity() { return this.__opacity; }
    set opacity(value) {
        this.__opacity = value;
    }

    get transformation() { return this.__transformation; }
    set transformation(value) {
        this.__transformation = value;
    }

    get rotation() { return this.__transformation.rotation; }
    set rotation(value) {
        this.__transformation.rotation = value;
    }
    
    get position() { return this.__transformation.position; }
    set position(value) {
        this.__transformation.position = value;
    }
    
    get anchor() { return this.__transformation.anchor; }
    set anchor(value) {
        this.__transformation.anchor = value;
    }
    
    get scale() { return this.__transformation.scale; }
    set scale(value) {
        this.__transformation.scale = value;
    }

    get parent() { return this.__parent; }
    set parent(value) {
        this.__parent = value;
    }

    addChild(sprite) {
        this.__children.push(sprite);
        sprite.parent = this;
    }

    removeChild(sprite) {
        for (let i = 0; i < this.__children.length; ++i) {
            if (this.__children[i] == sprite) {
                this.__children.splice(i, 1);
                sprite.parent = null;
                break;
            }
        }
    }

    draw() {
        this.__transformation.push();
        this.__transformation.apply();
        this.__bumble.context.globalAlpha *= this.__opacity;
        if (this.__debugDraw) {    
            this.__bumble.context.fillStyle = this.__color;
            this.__bumble.context.fillRect(0, 0, this.__transformation.width, this.__transformation.height);
        }
        for (let child of this.__children) {
            child.draw();
        }
        this.__transformation.pop();
    }
}

class BumbleImageSprite extends BumbleSprite {
    constructor(bumble, image) {
        super(bumble, image.width, image.height);
        this.__image = image;
        this.__image.anchor = new BumbleVector(0, 0);
    }

    setSize(width, height) {
        super.setSize(width, height);
        this.__image.setSize(this.width, this.height);
    }

    draw() {
        this.__transformation.push();
        this.__transformation.apply();
        this.__image.draw();
        this.__transformation.pop();
    }
}

class BumbleParticle extends BumbleSprite {
    constructor(bumble, width, height, image) {
        super(bumble, width, height);
        this.__bumble = bumble;
        this.__image = image;
        this.__image.anchor = new BumbleVector(0, 0);
        this.__image.setSize(width, height);
        this.__alive = false;
    }

    draw() {
        this.__transformation.push();
        this.__transformation.apply();
        this.__bumble.context.globalAlpha *= this.__opacity;
        this.__image.draw();
        this.__transformation.pop();
    }

    get alive() { return this.__alive; }
    set alive(value) {
        this.__alive = value;
    }
}

class BumbleParticleEmitter extends BumbleSprite {
    constructor(bumble, life, rate, emitterFunc, particleCreater, particleNumber = 100) {
        super(bumble, 1, 1);
        this.__life = life;
        this.__rate = rate;
        this.__emitterFunc = emitterFunc;
        this.__particleCreater = particleCreater;
        this.__particleNumber = particleNumber;
        this.__currentLife = 0;
        this.__particles = [];
        for (let i = 0; i < particleNumber; ++i) {
            this.__particles.push(particleCreater());
        }
        this.__currentNumber = 0;
        this.__startTime = 0;
        this.__started = false;
    }

    start() {
        if (this.__started) {
            return;
        }

        this.__bumble.runCoroutine(function *() {
            while (this.__bumble.gameTime - this.__startTime < this.__life) {
                this.emit();
                yield BumbleUtility.wait(this.__rate);
            }
        }.bind(this));

        this.__startTime = this.__bumble.gameTime;
    }

    __getNextParticle() {
        if (this.__currentNumber === this.__particleNumber) {
            return null;
        }
        this.__currentNumber += 1;
        const particle = this.__particles[this.__currentNumber - 1];
        particle.opacity = 1.0;
        particle.rotation = 0;
        particle.position = new BumbleVector();
        particle.alive = true;
        return particle;
    }

    emit() {
        this.__emitterFunc(this.__getNextParticle.bind(this));
    }

    draw() {
        this.__transformation.push();
        this.__transformation.apply();
        for (let i = 0; i < this.__currentNumber;) {
            if (this.__particles[i].alive) {
                this.__particles[i].draw();
                ++i;
            } else {
                const temp = this.__particles[this.__currentNumber - 1];
                this.__particles[this.__currentNumber - 1] = this.__particles[i];
                this.__particles[i] = temp;
                this.__currentNumber -= 1;
            }
        }
        this.__transformation.pop();
    }
}
