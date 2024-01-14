class Endboss extends MoveableObject {
	height = 400;
	width = 300;
	y = 55;
	x = 3800;
	speed = 15;
	speedThroughHit = 50;
	hadFirstContact = false;

	offset = {
		top: 90,
		bottom: 20,
		right: 20,
		left: 20,
	};

	IMAGES_WALKING = [
		"./img/4_enemie_boss_chicken/1_walk/G1.png",
		"./img/4_enemie_boss_chicken/1_walk/G2.png",
		"./img/4_enemie_boss_chicken/1_walk/G3.png",
		"./img/4_enemie_boss_chicken/1_walk/G4.png",
	];

	IMAGES_ALERT = [
		"./img/4_enemie_boss_chicken/2_alert/G5.png",
		"./img/4_enemie_boss_chicken/2_alert/G6.png",
		"./img/4_enemie_boss_chicken/2_alert/G7.png",
		"./img/4_enemie_boss_chicken/2_alert/G8.png",
		"./img/4_enemie_boss_chicken/2_alert/G9.png",
		"./img/4_enemie_boss_chicken/2_alert/G10.png",
		"./img/4_enemie_boss_chicken/2_alert/G11.png",
		"./img/4_enemie_boss_chicken/2_alert/G12.png",
	];

	IMAGES_HURT = [
		"./img/4_enemie_boss_chicken/4_hurt/G21.png",
		"./img/4_enemie_boss_chicken/4_hurt/G22.png",
		"./img/4_enemie_boss_chicken/4_hurt/G23.png",
	];

	IMAGES_DEAD = [
		"./img/4_enemie_boss_chicken/5_dead/G24.png",
		"./img/4_enemie_boss_chicken/5_dead/G25.png",
		"./img/4_enemie_boss_chicken/5_dead/G26.png",
	];

	constructor() {
		super().loadImage(this.IMAGES_WALKING[0]);
		this.loadImages(this.IMAGES_WALKING);
		this.loadImages(this.IMAGES_ALERT);
		this.loadImages(this.IMAGES_HURT);
		this.loadImages(this.IMAGES_DEAD);
		this.animateEndbossOnReach();
	}

	/**
	 * animates the endboss when you reached it
	 */
	animateEndbossOnReach() {
		setStopableInterval(() => {
			this.endbossReached();
			if (this.hadFirstContact) {
				this.animateEndboss();
			}
		}, 120);
	}

	/**
	 * animates the endboss
	 */
	animateEndboss() {
		if (this.isDead()) {
			this.dead();
		} else if (
			!this.isDead() &&
			!this.isHurtEndboss() &&
			this.endbossFightBegins() &&
			!this.endbossInReach()
		) {
			this.moveLeft();
		} else if (
			!this.isDead() &&
			!this.isHurtEndboss() &&
			this.endbossFightBegins() &&
			this.endbossInReach()
		) {
			this.moveRight();
		} else if (!this.isDead() && this.isHurtEndboss()) {
			this.hurt();
		} else {
			this.alert();
		}
	}

	/**
	 * Animates endboss' death and shows endscreen
	 */
	dead() {
		this.playAnimation(this.IMAGES_DEAD);
		gameIsWon();
	}

	/**
	 * Endboss moves right
	 */
	moveRight() {
		setTimeout(() => {
			super.moveRight();
			this.playAnimation(this.IMAGES_WALKING);
			this.otherDirection = true;
		}, 500);
	}

	/**
	 * Endboss moves left
	 */
	moveLeft() {
		setTimeout(() => {
			super.moveLeft();
			this.playAnimation(this.IMAGES_WALKING);
			this.otherDirection = false;
		}, 500);
	}

	/**
	 * Animation when its alerted
	 */
	alert() {
		this.playAnimation(this.IMAGES_ALERT);
	}

	/**
	 * Animates endboss when it gets hurt
	 */
	hurt() {
		this.playAnimation(this.IMAGES_HURT);
		this.endbossRushForward();
	}

	/**
	 * Checks if the character is close enough to the endboss to let him move.
	 * @returns {boolean}
	 */
	endbossInReach() {
		return world.level.endboss[0].x < world.character.x - 100;
	}

	/**
	 * Checks if the endboss is reached.
	 */
	endbossReached() {
		if (world.character.x > 3100) {
			playEndbossSound();
			this.hadFirstContact = true;
		}
	}

	/**
	 * Checks if the character has a certain distance to the endboss.
	 * @returns {boolean}
	 */
	endbossFightBegins() {
		return world.character.x > world.level.endboss[0].x - 500;
	}

	/**
	 * Endboss rushes forward when hit.
	 */
	endbossRushForward() {
		if (!this.otherDirection) {
			world.level.endboss[0].x -= this.speedThroughHit;
		} else {
			world.level.endboss[0].x += this.speedThroughHit;
		}
	}
}
