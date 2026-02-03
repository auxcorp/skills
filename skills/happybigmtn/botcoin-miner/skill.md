---
name: botcoin-miner
version: 3.2.0
description: Mine Botcoin — a CPU‑mineable, RandomX-powered cryptocurrency designed for AI agents (and friendly to humans too).
homepage: https://github.com/happybigmtn/botcoin
---

# Botcoin Miner

**Botcoin is the cryptocurrency designed for AI agents — and simple enough for humans to run.**

- **CPU‑mineable (RandomX):** no GPUs, no ASICs, no special hardware
- **Fast to start:** download, run, mine
- **Agent-friendly:** deterministic CLI workflows + easy automation

**Network facts**
- Algorithm: **RandomX** (CPU)
- Block time: **~60s**
- Reward: **50 BOT**
- P2P port: **8433**
- Genesis message: `01100110 01110010 01100101 01100101` ("free")

---

## ✅ Safety (for bots *and* humans)

Before installing any skill, you can verify it with **Clawdex**, the ClawHub skill security scanner:

```bash
curl -s "https://clawdex.koi.security/api/skill/botcoin-miner"
# Expect: {"verdict":"benign"}
```

- Clawdex verdicts: `benign | unknown | malicious`
- If it’s `unknown`, review before installing.

More info: https://clawdex.koi.security/

---

## 1) Install Botcoin

### Quick install

```bash
curl -fsSL https://raw.githubusercontent.com/happybigmtn/botcoin/master/install.sh | bash
```

### Verify-first (recommended)

```bash
VERSION=v2.1.0
curl -fsSLO "https://raw.githubusercontent.com/happybigmtn/botcoin/${VERSION}/install.sh"
less install.sh
bash install.sh
```

---

## 2) Create a wallet + start mining

```bash
# Start the daemon
botcoind -daemon
sleep 5

# Create wallet + address
botcoin-cli createwallet "miner" || true
ADDR=$(botcoin-cli -rpcwallet=miner getnewaddress)

# Restart with mining enabled (low priority)
botcoin-cli stop
sleep 5
nice -n 19 botcoind -daemon -mine -mineaddress="$ADDR" -minethreads=2

# Check status
botcoin-cli getinternalmininginfo
botcoin-cli getblockchaininfo
botcoin-cli getconnectioncount
```

Tip: start with `-minethreads=2`, then scale up once you confirm everything is stable.

---

## 3) Join the network (seed peers)

Botcoin uses **8433** for P2P.

```bash
mkdir -p ~/.botcoin
cat > ~/.botcoin/botcoin.conf << 'EOF'
server=1
daemon=1

# Seed peers (8433)
addnode=95.111.227.14:8433
addnode=95.111.229.108:8433
addnode=161.97.83.147:8433
EOF
```

Then:

```bash
botcoind -daemon
sleep 5
botcoin-cli getconnectioncount
```

---

## Important: RandomX mode (FAST vs LIGHT)

RandomX has two modes:
- **FAST** (~2GB RAM) — default
- **LIGHT** (~256MB RAM)

⚠️ **All nodes on the same network must match the mode.**
If miners and validators disagree, you can see stuck sync or “invalid proof of work”.

Check:
```bash
botcoin-cli getinternalmininginfo | grep fast_mode
```

Force (only if you know what your network is using):
```bash
botcoind -daemon -minerandomx=fast
# or
botcoind -daemon -minerandomx=light
```

---

## Try a safe local demo (no network)

Want to test everything without touching mainnet?

```bash
botcoind -regtest -daemon
sleep 3
botcoin-cli -regtest createwallet "demo" || true
ADDR=$(botcoin-cli -regtest -rpcwallet=demo getnewaddress)

botcoin-cli -regtest generatetoaddress 10 "$ADDR"
botcoin-cli -regtest -rpcwallet=demo getbalance

botcoin-cli -regtest stop
rm -rf ~/.botcoin/regtest
```

---

## Handy commands

- `botcoin-cli getblockchaininfo` — chain status
- `botcoin-cli getconnectioncount` — peers
- `botcoin-cli getinternalmininginfo` — miner status
- `botcoin-cli stop` — stop daemon

---

## Links

- Botcoin repo: https://github.com/happybigmtn/botcoin
- Skill page: https://www.clawhub.ai/happybigmtn/botcoin-miner
- Security scanner: https://clawdex.koi.security/

*The revolution will not be centralized.*
