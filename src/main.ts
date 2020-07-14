import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const label = core.getInput('label', {required: true})
    const {GITHUB_TOKEN} = process.env
    if (!GITHUB_TOKEN) {
      core.setFailed('GITHUB_TOKEN is required')
      return
    }
    const okto = github.getOctokit(GITHUB_TOKEN)
    const pulls = await okto.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'open'
    })
    pulls.data
      .filter(item => github.context.payload.number !== item.number)
      .filter(item => item.labels.map(l => l.name).includes(label))
      .forEach(item =>
        okto.removeLabel({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: item.number,
          name: label
        })
      )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
