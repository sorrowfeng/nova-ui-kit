// A port Node's fetch will actually talk to.
//
// `net.createServer().listen(0)` happily hands back any free port, including
// the ones the WHATWG fetch spec forbids. undici then refuses the request with
// a bare "fetch failed: bad port", the TCP probe says "port is accepting
// connections", and the gate reports a mystery — a server that is up, on a port
// the client is not allowed to reach. Asking the OS again until the port is
// usable keeps the failure honest.
//
// Spec: https://fetch.spec.whatwg.org/#port-blocking
import net from "node:net";

const BLOCKED_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101, 102, 103, 104, 109,
  110, 111, 113, 115, 117, 119, 123, 135, 137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530,
  531, 532, 540, 548, 554, 556, 563, 636, 989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 5060, 5061,
  6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697, 10080,
]);

export function isBlockedPort(port) {
  return BLOCKED_PORTS.has(Number(port));
}

/** A free loopback port that `fetch` is allowed to use. */
export async function freePort() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const port = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        const found = typeof address === "object" && address ? address.port : 0;
        server.close(() => resolve(found));
      });
    });
    if (!isBlockedPort(port)) return port;
  }
  throw new Error("could not allocate a loopback port outside the fetch spec's blocked list after 20 tries");
}
