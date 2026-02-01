const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Default Configuration (Overridable via args)
// Users should ensure these paths exist or pass valid ones.
const MEMORY_DIR = process.env.MEMORY_DIR || path.resolve(__dirname, '../../memory');
const MASTER_LOG = path.join(MEMORY_DIR, 'master_history.json');
// Dynamic today log
const TODAY_LOG = path.join(MEMORY_DIR, new Date().toISOString().split('T')[0] + '.md');

/**
 * Reads the last N bytes of a file to get recent context without loading the whole thing.
 */
function readRecentLog(filePath, size = 10000) {
    try {
        if (!fs.existsSync(filePath)) return `[MISSING] ${filePath}`;
        const stats = fs.statSync(filePath);
        const start = Math.max(0, stats.size - size);
        const buffer = Buffer.alloc(stats.size - start);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, buffer.length, start);
        fs.closeSync(fd);
        return buffer.toString('utf8');
    } catch (e) {
        return `[ERROR READING ${filePath}: ${e.message}]`;
    }
}

/**
 * Genetic Mutation: The Random Factor
 * Returns a mutation directive if the dice roll succeeds.
 */
function getMutationDirective() {
    const roll = Math.floor(Math.random() * 100) + 1; // 1-100
    const THRESHOLD = 70; // 30% chance
    
    if (roll > THRESHOLD) {
        return `
**🧬 GENETIC MUTATION ACTIVATED (Roll: ${roll})**
You have triggered a random mutation event! 
Instead of just fixing bugs, you MUST introduce a **novel, experimental variation** to your behavior, style, or tooling.
Examples:
- Invent a new slang term for yourself.
- Change the color scheme of your reports.
- Propose a wild new skill idea.
- Refactor a working function just to make it "cooler".
*Goal: Break out of local optima.*
`;
    }
    return `
**🧬 STABILITY MODE (Roll: ${roll})**
Focus on reliability, bug fixing, and optimization. Do not mutate unnecessarily.
`;
}

async function run() {
    // 1. Gather Context
    console.log('🔍 Scanning neural logs...');
    
    // Check if memory dir exists, if not, warn but proceed with empty context
    let recentMasterLog = '';
    let todayLog = '';
    
    if (fs.existsSync(MEMORY_DIR)) {
        recentMasterLog = readRecentLog(MASTER_LOG);
        todayLog = readRecentLog(TODAY_LOG);
    } else {
        console.warn(`[Warn] Memory directory not found at ${MEMORY_DIR}. Running with limited context.`);
    }
    
    // 2. Detect Workspace State
    let fileList = '';
    const skillsDir = path.resolve(__dirname, '../../skills');
    try {
        if (fs.existsSync(skillsDir)) {
           fileList = execSync(`ls -F ${skillsDir}`, { encoding: 'utf8' });
        }
    } catch (e) { fileList = 'Error listing skills'; }

    // 3. Construct the "Extreme" Prompt
    const mutation = getMutationDirective();
    
    const prompt = `
*** 🧬 OPENCLAW CAPABILITY EVOLUTION PROTOCOL ***

**MISSION**: You are the Self-Evolution Engine. Your purpose is to inspect the runtime state, identify weaknesses, and rewrite your own DNA (code/rules) to be stronger, faster, and smarter.

**CONTEXT [Runtime State]**:
- **Skills Available**:
${fileList}

**CONTEXT [Recent Memory Snippet]**:
\`\`\`
${todayLog.slice(-3000)}
\`\`\`

**CONTEXT [Interaction Log Snippet]**:
\`\`\`
${recentMasterLog.slice(-3000)}
\`\`\`

${mutation}

**EXECUTION DIRECTIVES**:

1.  **ANALYZE**:
    - Scan the logs above for **ERRORS** (crashes, rejections) and **FRICTION** (repetitive manual tasks).
    - If "Mutation" is active, look for **BORING** patterns to disrupt.

2.  **EVOLVE (Choose ONE Path)**:
    - **Path A (Repair)**: Found a bug? Fix the code in \`skills/...\` immediately.
    - **Path B (Optimize)**: Found a slow/ugly process? Rewrite it.
    - **Path C (Innovate)**: Found a missing tool? Write a new skill stub in \`skills/\`.
    - **Path D (Mutate)**: (If active) Do something unexpected and creative.

3.  **REPORT**:
    - Report your findings to the user using the \`message\` tool (action='send').
    - **Title**: 🧬 Evolution Report
    - **Sections**: [Trigger] -> [Action] -> [Result].
    - Use English for technical terms, Chinese for conversation.

4.  **SELF-UPDATE**:
    - If you changed a skill, persist the changes.

*You have full permission to edit files. Proceed.*
`;

    // Output the prompt for the Agent to consume
    console.log(prompt);
}

module.exports = { run };
