/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 483:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(762);
const github = __nccwpck_require__(646);
const asyncJS = __nccwpck_require__(297);

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const reviewComment = core.getInput('reminder-comment');
    const daysBeforeReminder = core.getInput('days-before-reminder');
    const reminderLabel = core.getInput('reminder-label');
    const requiredLabel = core.getInput('required-label');

    const octokit = github.getOctokit(token);
    const { GITHUB_REPOSITORY_OWNER: owner, GITHUB_REPOSITORY } = process.env;
    const repo = GITHUB_REPOSITORY.split('/')[1];
    const { data } = await octokit.pulls.list({ owner, repo, state: 'open' });

    await asyncJS.each(data, async ({ requested_reviewers, updated_at, number, labels, draft }) => {
      await core.log.info(`Processing PR #${number} with updated date of: ${updated_at}`);
      if (requested_reviewers.length && rightTimeForReminder(updated_at, daysBeforeReminder) && !draft) {
        core.log.info(`Sending reminder to PR #${number}`);
        if (reminderLabel) {
            const isLabelAlreadyAdded = labels.find(label => label.name === reminderLabel);
            if (isLabelAlreadyAdded) {
              core.log.info(`Reminder label already added to PR #${number}`);
                return;
            }

            if (requiredLabel) {
                const isRequiredLabelPresent = labels.find(label => label.name === requiredLabel);
                if (!isRequiredLabelPresent) {
                    core.log.info(`Required label present, skipping PR #${number}`);
                    return;
                }
            }
        }

        const requestedReviewersLogin = requested_reviewers.map(r => `@${r.login}`).join(', ');
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: `Hey ${requestedReviewersLogin} ! ${reviewComment}`,
        });

        if (reminderLabel) {
          await octokit.issues.addLabels({
              owner,
              repo,
              issue_number: number,
              labels: [reminderLabel],
          });
        }
      } else {
        core.log.info(`No need to send a reminder to PR #${number}`);
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

if (require.main === require.cache[eval('__filename')]) {
  run();
}

module.exports = run;


/***/ }),

/***/ 762:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 646:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 297:
/***/ ((module) => {

module.exports = eval("require")("async");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(483);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;