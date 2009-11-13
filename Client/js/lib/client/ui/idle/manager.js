client.namespace("client.ui.idle");

client.ui.idle.manager = function (arg) {
	this.events = new client.events.manager(arg.events || {});

	that = this, this.isIdle = 0, this.sensors = arg.sensors || [];
	for (var i = 0; i < this.sensors.length; i++)
		this.sensors[i] = new this.sensors[i]({
			events: {
				enteringIdle: function () {
					if (that.isIdle == 0)
						that.events.publish("enteringIdle");
					that.isIdle++;
				},
				leavingIdle: function () {
					that.isIdle--;
					if (that.isIdle == 0)
						that.events.publish("leavingIdle");
				}
			}
		});

	var delegateMethods = ["start", "cancel", "keepalive"];
	for (var i = 0; i < delegateMethods.length; i++)
		this[delegateMethods[i]] = function (that, methodName) {return function () {
			for (var i = 0; i < that.sensors.length; i++)
				that.sensors[i][methodName](arguments);
		}}(this, delegateMethods[i]);
};

client.ui.idle.manager.prototype.timePassed = function () {
	var longestIdleTime = 0;
	for (var i = 0; i < this.sensors.length; i++) {
		var idleTime = this.sensors[i].timePassed();
		if (idleTime > longestIdleTime)
			longestIdleTime = idleTime;
	}
	return longestIdleTime;
};
