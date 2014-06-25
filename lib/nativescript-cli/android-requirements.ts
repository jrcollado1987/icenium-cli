
export class AndroidRequirements {

	public checkRequirements(): boolean {
		return this.checkAndroid() && this.checkAnt() && this.checkJava();
	}

	private checkAndroid(): boolean {
		return true;
	}

	private checkJava(): boolean {
		return true;
	}

	private checkAnt(): boolean {
		return true;
	}
}