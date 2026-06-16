// Measurement assertion: counts lines inside fenced code blocks. Always passes;
// the score is the line count, so promptfoo's table shows LOC per arm.
module.exports = (output) => {
  const blocks = [...String(output).matchAll(/```[\s\S]*?```/g)];
  const lines = blocks.reduce((n, b) => n + Math.max(0, b[0].split('\n').length - 2), 0);
  return { pass: true, score: lines, reason: `${lines} code lines` };
};
