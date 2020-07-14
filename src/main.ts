import * as core from '@actions/core'
import * as github from '@actions/github'

class Logger {
  private isDebug: boolean
  constructor(debug: boolean) {
    this.isDebug = debug
  }
  public debug(msg: any) {
    if (this.isDebug) {
      console.log(msg)
    }
  }
}

async function run(): Promise<void> {
  try {
    const label = core.getInput('label', {required: true})
    const log = new Logger(core.getInput('debug') === 'true')
    log.debug(`debug is on`)
    const {GITHUB_TOKEN} = process.env
    if (!GITHUB_TOKEN) {
      core.setFailed('GITHUB_TOKEN is required')
      return
    }
    log.debug(`got label ${label}`)
    const okto = github.getOctokit(GITHUB_TOKEN)
    const pulls = await okto.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'all'
    })
    log.debug(pulls)
    pulls.data
      .filter(item => github.context.payload.number !== item.number)
      .filter(item => item.labels.map(l => l.name).includes(label))
      .forEach(item =>
        okto.issues.removeLabel({
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
