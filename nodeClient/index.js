// node program that captures local performance data
// and sends it up to the socket.io server
// req farmhash and socket.io-client

const os = require("os");
const io = require("socket.io-client");
let socket = io("http://localhost:8181");

socket.on("connect", () => {
  // id this machine
  const ni = os.networkInterfaces();
  let macA;
  for (let key in ni) {
    if (!ni[key][0].internal) {
      macA = ni[key][0].mac;
      break;
    }
  }

  // client auth with single key value
  socket.emit("clientAuth", "aoeu");
  // start sending data over
  let perfDataInterval = setInterval(() => {
    performanceData().then(data => {
      // console.log(data);
      socket.emit("perfData", data);
    });
  }, 1000);
});

function performanceData() {
  return new Promise(async (resolve, reject) => {
    const osType = os.type() == "Darwin" ? "Mac" : os.type();
    const uptime = os.uptime();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const memUsage = Math.floor((usedMem / totalMem) * 100) / 100;
    const numCores = os.cpus().length;
    const cpuModel = os.cpus()[0].model;
    const cpuSpeed = os.cpus()[0].speed;

    const cpuLoad = await getCpuLoad();
    resolve({
      freeMem,
      totalMem,
      memUsage,
      osType,
      uptime,
      cpuModel,
      numCores,
      cpuSpeed,
      cpuLoad
    });
  });
}
// get the average of all cores usage
function cpuAverage() {
  const cpus = os.cpus();
  const numCores = os.cpus().length;
  // get ms in each mode since reboot. get now and in 100ms and compare.
  let idleMs = 0,
    totalMs = 0;

  cpus.forEach(core => {
    //loop through properties of the current core
    for (type in core.times) {
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  });
  return {
    idle: idleMs / numCores,
    total: totalMs / numCores
  };
}

function getCpuLoad() {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      // calculate percentage of used cpu
      const percentageCpu =
        100 - Math.floor(100 * (idleDifference / totalDifference));
      resolve(percentageCpu);
    }, 100);
  });
}
