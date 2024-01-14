class MoveableObject extends DrawableObject {
	speed = 0.15;
	speedY = 0;
	energy = 100;
	lastHit = 0;
	acceleration = 3;
	progessCoinBar = 0;
	progressBottleBar = 0;
	otherDirection = false;

	/**
	 * Applies gravity to movable objects
	 */
	applyGravity() {
		setStopableInterval(() => {
			if (this.isAboveGround() || this.speedY > 0) {
				this.y -= this.speedY;
				this.speedY -= this.acceleration;
			} else {
				return (this.y = 180);
			}
		}, 1000 / 30);
	}

	/**
	 * Checks if the moveable object is above the ground.
	 * @returns {boolean}
	 */
	isAboveGround() {
		if (this instanceof ThrowableObject) {
			return true;
		} else {
			return this.y < 180;
		}
	}

	/**
	 * Checks if the element collides with an moveable object.
	 * @param {object} mo
	 * @returns {object} 
	 */
	isColliding(mo) {
		return (
			this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
			this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
			this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
			this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
		);
	}

	hit() {
		this.energy -= 10;
		if (this.energy < 0) {
			this.energy = 0;
		} else {
			this.lastHit = new Date().getTime();
		}
	}

	hitEndboss() {
		this.energy -= 20;
		if (this.energy < 0) {
			this.energy = 0;
		} else {
			this.lastHit = new Date().getTime();
		}
	}

	/**
	 * Calculates the time since the character was last hitted.
	 * @returns {number}
	 */
	isHurt() {
		let timepassed = new Date().getTime() - this.lastHit;
		timepassed = timepassed / 500;
		return timepassed < 1;
	}

	/**
	 * Calculates the time since the endboss was last hitted.
	 * @returns {number}
	 */
	isHurtEndboss() {
		let timepassed = new Date().getTime() - this.lastHit;
		timepassed = timepassed / 1000;
		return timepassed < 0.5;
	}

	/**
	 * Checks if the object is dead.
	 * @returns {boolean}
	 */
	isDead() {
		return this.energy == 0;
	}

	/**
	 * Sets the energy to 0 when chicken is killed.
	 * @returns {number}
	 */
	chickenKilled() {
		return (this.energy = 0);
	}

	raiseProgressbarCoin() {
		this.progessCoinBar += 5;
	}

	raiseProgressbarBottle() {
		this.progressBottleBar += 10;
	}

	reduceProgressbarBottle() {
		this.progressBottleBar -= 10;
	}

	/**
	 * Plays the animation of the images inside of the current array.
	 * @param {string} images
	 */
	playAnimation(images) {
		let i = this.currentImage % images.length;
		let path = images[i];
		this.img = this.imageCache[path];
		this.currentImage++;
	}

	moveLeft() {
		this.x -= this.speed;
	}

	moveRight() {
		this.x += this.speed;
	}

	jump() {
		this.speedY = 30;
	}
}
