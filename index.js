#!/usr/bin/env node

const cli = require('commander')
const pkg = require('./package.json')
const cfg = require('./lib/config')
const core = require('./core')

cli.version(pkg.version).usage('<command> [option] <addon ...>')

cli
  .command('add <addons...>')
  .description('install one or more addons locally')
  .alias('install')
  .alias('get')
  .option('--anyway', 'install latest addon release for _classic_ mode anyway')
  .action((aa, cmd) => {
    cfg.anyway(cmd.anyway)
    core.add(aa)
  })

cli
  .command('rm <addon...>')
  .description('remove addons from local installation')
  .alias('delete')
  .alias('uninstall')
  .alias('remove')
  .alias('del')
  .action(key => core.rm(key))

cli
  .command('search <text>')
  .description('search addons whose name contain <text>')
  .option(
    '--anyway',
    'search for latest addon release for _classic_ mode anyway'
  )
  .option(
    '-i',
    'Install from search result indexes'
  )
  .action((text, cmd) => {
    cfg.anyway(cmd.anyway)
    core.search(text, cmd.i)
  })

cli
  .command('ls')
  .description('list all installed addons')
  .option('-l, --long', 'show detailed addon information')
  .option('-t, --time', 'sort by updated time')
  .alias('list')
  .action(core.ls)

cli
  .command('info <addon>')
  .description(
    'show info of an addon, the addon does not have to be an installed locally'
  )
  .option(
    '--anyway',
    'show info of latest addon release for _classic_ mode anyway'
  )
  .action((ad, cmd) => {
    cfg.anyway(cmd.anyway)
    core.info(ad)
  })

cli
  .command('update')
  .description('update all installed addons')
  .option('--anyway', 'update latest addon release for _classic_ mode anyway')
  .option(
    '--db',
    'for update addon database, no addon will be updated if this option is specified'
  )
  .action(cmd => {
    cfg.anyway(cmd.anyway)
    core.update(cli.args.length > 1 ? cli.args.slice(0, -1) : null, cmd)
  })

cli
  .command('import')
  .description('import local addons')
  .action(() => core.pickup())

cli
  .command('pin <addon...>')
  .description("pin an addon to it's current version, prevent it from updating")
  .action(key => core.pin(key, 1))

cli
  .command('unpin <addon...>')
  .description("unpin an addon, allow it to be updated")
  .action(key => core.pin(key, 0))

cli
  .command('switch')
  .alias('sw')
  .description('switch mode between retail and classic')
  .option('--ptr', 'switch mode to: retail PTR')
  .option('--beta', 'switch mode to: retail BETA')
  .option('--retail', 'switch mode to: retail formal')
  .option('--retail-ptr', 'switch mode to: retail PTR')
  .option('--retail-beta', 'switch mode to: retail BETA')
  .option('--classic', 'switch mode to: classic formal')
  .option('--classic-tbc', 'switch mode to: classic TBC')
  .option('--classic-ptr', 'switch mode to: classic PTR')
  .option('--classic-beta', 'switch mode to: classic BETA')
  .action(core.switch)

cli
  .command('restore [repo]')
  .description(
    'restore addons from github repo, only <org/repo> is required, not the full URL. (e.g. antiwinter/wowui)'
  )
  .option(
    '-f, --full',
    'not only restore addons, but also restore addons settings'
  )
  .action(repo => core.restore(repo))

cli.on('command:*', () => {
  cli.help()
})

if (process.argv.length < 3) return cli.help()

// do the job

if (!cfg.checkPath()) return

core.checkUpdate(() => {
  cli.parse(process.argv)
})
