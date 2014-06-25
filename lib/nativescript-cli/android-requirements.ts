
export class AndroidRequirements{

	constructor(private $childProcess: IChildProcess) { }

	public checkRequirements(): IFuture<boolean>  {
		return this.checkAndroid() && this.checkAnt() && this.checkJava();
	}

	private checkAndroid(): IFuture<boolean> {
		return(() => {
			var output = this.$childProcess.exec("android list targets").wait();
			return true;
		}).future<boolean>()();
	}

	private checkJava(): IFuture<boolean> {
		return (() => {
			return true;
		}).future<boolean>()();
	}

	private checkAnt(): IFuture<boolean> {
		return (() => {
			return true;
		}).future<boolean>()();
	}
}