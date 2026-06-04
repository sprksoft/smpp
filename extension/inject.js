// EEeewww js in mijn .ts project?? -Lukas probably

const raw = window.SMSC?.vars; // mmmmm lekkere data
const safe = JSON.parse(JSON.stringify(raw)); // er was lik een of ander random ass datatype da nie wou dus moet ik dit doen idk
window.postMessage({ type: 'SMSC_VARS', payload: safe }, '*'); // elke line in deze hele file heeft een comment wa een helpful maintainer da ik ben + rip mijn job sercurity