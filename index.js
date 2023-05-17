const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const reviewComment = core.getInput('reminder-comment');
    const daysBeforeReminder = core.getInput('days-before-reminder');
    const reminderLabel = core.getInput('reminder-label');

    const octokit = github.getOctokit(token);
    const { GITHUB_REPOSITORY_OWNER: owner, GITHUB_REPOSITORY } = process.env;
    const repo = GITHUB_REPOSITORY.split('/')[1];
    const { data } = await octokit.pulls.list({ owner, repo, state: 'open' });

    data.forEach(({ requested_reviewers, pushed_at, number, labels }) => {
      console.log(`Processing PR #${number} with pushed date of: ${pushed_at}`);
      if (requested_reviewers.length && rightTimeForReminder(pushed_at, daysBeforeReminder)) {
        console.log(`Sending reminder to PR #${number}`);
        if (reminderLabel != null) {
            const isLabelAlreadyAdded = labels.find(label => label.name === reminderLabel);
            if (isLabelAlreadyAdded) {
              console.log(`Reminder label already added to PR #${number}`);
                return;
            }
        }

        const requestedReviewersLogin = requested_reviewers.map(r => `@${r.login}`).join(', ');
        octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: `Hey ${requestedReviewersLogin} ! ${reviewComment}`,
        });

        if (reminderLabel) {
          octokit.issues.addLabels({
              owner,
              repo,
              issue_number: number,
              labels: [reminderLabel],
          });
        }
      } else {
        console.log(`No need to send a reminder to PR #${number}`);
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};

const rightTimeForReminder = (updatedAt, daysBeforeReminder) => {
  const today = new Date().getTime();
  const updatedAtDate = new Date(updatedAt).getTime();
  const daysInMilliSecond = 86400000 * daysBeforeReminder;
  return today - daysInMilliSecond > updatedAtDate;
};

if (require.main === module) {
  run();
}

module.exports = run;
