class World {
	level = level1;
	canvas;
	ctx;
	keyboard;
	camera_x = 0;
	collectedBottles = 0;
	character = new Character();
	statusBarLife = new StatusbarLife();
	statusBarCoin = new StatusbarCoin();
	statusBarBottle = new StatusbarBottle();
	statusBarEndboss = new StatusbarEndboss();
	statusBarEndbossIcon = new StatusbarEndbossIcon();
	throwAbleObject = [];

	AUDIO = {
		background_music: new Audio("./audio/background_music.mp3"),
		chicken_dead_sound: new Audio("./audio/chicken_dead.mp3"),
		bottle_collect_sound: new Audio("./audio/bottle.mp3"),
		endboss_fight: new Audio("./audio/endboss_fight.mp3"),
		bottle_smash: new Audio("./audio/bottle_smash.mp3"),
		game_over_sound: new Audio("./audio/game_over.mp3"),
		throw_sound: new Audio("./audio/throw_bottle.mp3"),
		coin_collect_sound: new Audio("./audio/coin.mp3"),
		game_win_sound: new Audio("./audio/game_win.mp3"),
		walking_sound: new Audio("./audio/walking.mp3"),
		jumping_sound: new Audio("./audio/jumping.mp3"),
		snoring_sound: new Audio("./audio/snoring.mp3"),
		hurt_sound: new Audio("./audio/pepe_hurt.mp3"),
		dead_sound: new Audio("./audio/pepe_dead.mp3"),
	};

	constructor(canvas, keyboard) {
		this.ctx = canvas.getContext("2d");
		this.canvas = canvas;
		this.keyboard = keyboard;
		this.draw();
		this.setWorld();
		this.checkCollisions();
		this.throwObjectInterval();
		this.checkCollisionsWithThrowingBottle();
	}

	/**
	 * Associates the character with the world.
	 */
	setWorld() {
		this.character.world = this;
	}

	/**
	 * Periodically checks for various collisions in the game.
	 */
	checkCollisions() {
		setStopableInterval(() => {
			this.checkCollisionsEnemy();
			this.checkCollisionCoins();
			this.checkCollisonsBottles();
			this.checkCollisionsEndboss();
		}, 1000 / 30);
	}

	/**
	 * Periodically checks for collisions between throwing objects and end bosses.
	 */
	checkCollisionsWithThrowingBottle() {
		setStopableInterval(() => {
			this.checkCollisionBottleWithEndboss();
		}, 200);
	}
	/**
	 * Periodically checks for throwing objects.
	 */
	throwObjectInterval() {
		setStopableInterval(() => {
			this.checkThrowObjects();
		}, 150);
	}

	/**
	 * Checks if objects can be thrown.
	 */
	checkThrowObjects() {
		if (this.canBottleBeThrown()) {
			let bottle = new ThrowableObject(
				this.character.x,
				this.character.y + 100,
				this.character.otherDirection
			);
			this.throwAbleObject.push(bottle);
			this.collectedBottles--;
			this.character.reduceProgressbarBottle();
			this.statusBarBottle.setPercentage(
				this.character.progressBottleBar
			);
			this.AUDIO.throw_sound.play();
		}
	}

	/**
	 * Checks if "Space" is pressed and bottles are collected.
	 * @returns {boolean}
	 */
	canBottleBeThrown() {
		return this.keyboard.SPACE && this.collectedBottles > 0;
	}

	checkCollisionsEnemy() {
		this.level.enemies.forEach((enemy) => {
			if (this.character.isColliding(enemy) && !this.character.isHurt()) {
				if (this.character.isAboveGround()) {
					this.killChickenWithJump(enemy);
				} else {
					this.character.hit();
					this.statusBarLife.setPercentage(this.character.energy);
				}
			}
		});
	}

	/**
	 * Check if there is collision with the endboss.
	 */
	checkCollisionsEndboss() {
		this.level.endboss.forEach((endboss) => {
			if (
				this.character.isColliding(endboss) &&
				!this.character.isHurt() &&
				!endboss.isDead()
			) {
				if (this.character.isAboveGround()) {
				} else {
					this.character.hit();
					this.statusBarLife.setPercentage(this.character.energy);
				}
			}
		});
	}

	/**
	 * Check if there is collision with the coins.
	 */
	checkCollisionCoins() {
		this.level.coins.forEach((coin) => {
			if (this.character.isColliding(coin)) {
				this.AUDIO.coin_collect_sound.currentTime = 0;
				this.coinCollected(coin);
				this.character.raiseProgressbarCoin();
				this.statusBarCoin.setPercentage(this.character.progessCoinBar);
				this.AUDIO.coin_collect_sound.play();
			}
		});
	}

	/**
	 * Check if there is collision with the bottles.
	 */
	checkCollisonsBottles() {
		this.level.bottles.forEach((bottle) => {
			if (this.character.isColliding(bottle)) {
				this.bottleCollected(bottle);
				this.character.raiseProgressbarBottle();
				this.statusBarBottle.setPercentage(
					this.character.progressBottleBar
				);
				this.AUDIO.bottle_collect_sound.currentTime = 0;
				this.AUDIO.bottle_collect_sound.play();
			}
		});
	}

	/**
	 * Check if there is collision with the bottles that are thrown to the endboss.
	 */
	checkCollisionBottleWithEndboss() {
		this.throwAbleObject.forEach((bottle) => {
			this.level.endboss.forEach((endboss) => {
				if (bottle.isColliding(endboss)) {
					endboss.hitEndboss(endboss.energy);
					this.statusBarEndboss.setPercentage(endboss.energy);
					this.AUDIO.chicken_dead_sound.currentTime = 0;
					this.AUDIO.bottle_smash.currentTime = 0;
					this.AUDIO.bottle_smash.play();
					this.AUDIO.chicken_dead_sound.play();
					setTimeout(() => {
						this.eraseThrowingBottleFromArray(bottle);
					}, 180);
				}
			});
		});
	}

	/**
	 * Checks if coins are collected.
	 * @param {boolean} coin collected coins
	 */
	coinCollected(coin) {
		let i = this.level.coins.indexOf(coin);
		this.level.coins.splice(i, 1);
	}

	/**
	 * Checks if bottles are collected.
	 * @param {boolean} bottle collected bottles
	 */
	bottleCollected(bottle) {
		let i = this.level.bottles.indexOf(bottle);
		this.level.bottles.splice(i, 1);
		this.collectedBottles++;
	}

	/**
	 * Kills the chicken when jumped on. Plays sound and let the character jump.
	 * @param {object} enemy current enemy
	 */
	killChickenWithJump(enemy) {
		this.AUDIO.chicken_dead_sound.currentTime = 0;
		enemy.chickenKilled();
		this.character.jump();
		this.AUDIO.chicken_dead_sound.play();
		clearInterval(enemy.animateChickenInterval);
		clearInterval(enemy.moveChickenInterval);
		enemy.loadImage(enemy.IMAGE_DEAD);
		setTimeout(() => {
			this.eraseEnemyFromArray(enemy);
		}, 550);
	}

	/**
	 * Removes the enemy from the game when killed.
	 * @param {object} enemy current enemy
	 */
	eraseEnemyFromArray(enemy) {
		let i = this.level.enemies.indexOf(enemy);
		this.level.enemies.splice(i, 1);
	}

	/**
	 * Removes the bottle from the array when throwed.
	 * @param {object} bottle current bottle
	 */
	eraseThrowingBottleFromArray(bottle) {
		let i = this.throwAbleObject.indexOf(bottle);
		this.throwAbleObject.splice(i, 1);
	}

	/**
	 * Periodically redraws the game elements on the canvas.
	 */
	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.translate(this.camera_x, 0);

		this.addWorldGraphics();
		this.addAllMoveableObjects();

		this.ctx.translate(-this.camera_x, 0);

		this.addStatusBars();

		let self = this;
		requestAnimationFrame(function () {
			self.draw();
		});
	}

	/**
	 * Adds all movable objects the the map.
	 */
	addAllMoveableObjects() {
		this.addObjectsToMap(this.level.bottles);
		this.addObjectsToMap(this.level.coins);
		this.addObjectsToMap(this.level.enemies);
		this.addObjectsToMap(this.level.endboss);
		this.addObjectsToMap(this.throwAbleObject);
		this.addToMap(this.character);
	}

	/**
	 * Adds background objects to the map.
	 */
	addWorldGraphics() {
		this.addObjectsToMap(this.level.backgroundObjects);
		this.addObjectsToMap(this.level.clouds);
	}

	/**
	 * Adds status bar to the map.
	 */
	addStatusBars() {
		this.addToMap(this.statusBarLife);
		this.addToMap(this.statusBarCoin);
		this.addToMap(this.statusBarBottle);
		this.addToMap(this.statusBarEndboss);
		this.addToMap(this.statusBarEndbossIcon);
	}

	/**
	 * Adds all the objects from the current array to the map.
	 * @param {object} objects specific object
	 */
	addObjectsToMap(objects) {
		objects.forEach((o) => {
			this.addToMap(o);
		});
	}

	/**
	 * Adds the moveable object to the map.
	 * @param {object} mo specific movable object
	 */
	addToMap(mo) {
		if (mo.otherDirection) {
			this.flipImage(mo);
		}
		mo.draw(this.ctx);
		if (mo.otherDirection) {
			this.flipImageBack(mo);
		}
	}

	/**
	 * Flips the images of the moveable object when direction is changed.
	 * @param {object} mo specific movable object that should be flipped
	 */
	flipImage(mo) {
		this.ctx.save();
		this.ctx.translate(mo.width, 0);
		this.ctx.scale(-1, 1);
		mo.x = mo.x * -1;
	}

	/**
	 * Flips the images back of the moveable object when direction is changed.
	 * @param {object} mo specific movable object that should be flipped
	 */
	flipImageBack(mo) {
		this.ctx.restore();
		mo.x = mo.x * -1;
	}
}