const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const reviewComment = core.getInput('reminder-comment');
    const daysBeforeReminder = core.getInput('days-before-reminder');

    const octokit = github.getOctokit(token);
    const owner = github.context.payload.sender.login;
    const repo = github.context.payload.repository.name;

    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });

    data.forEach(({ requested_reviewers, updated_at }) => {
      if (rightTimeForReminder(updated_at, daysBeforeReminder)) {
        const requestedReviewersLogin = requested_reviewers.map(r => `@${r.login}`).join(', ');
        octokit.issues.createComment({ 
          owner,
          repo,
          issue_number: data[i].number,
          body: `Hey ${requestedReviewersLogin} ! ${reviewComment}`,
        });
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};

const rightTimeForReminder = (updatedAt, daysBeforeReminder) => {
  const today = new Date();
  const updatedAtDate = new Date(updatedAt).getTime();
  const daysInMilliSecond = 86400000 * daysBeforeReminder;
  console.log(updatedAtDate - daysInMilliSecond, today, updatedAtDate - daysInMilliSecond > today);
  return updatedAtDate - daysInMilliSecond > today;
};

if (require.main === module) {
  run();
}

module.exports = run;
