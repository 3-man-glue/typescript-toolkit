import 'reflect-metadata'
import ModuleAlias from 'module-alias'

(function setupAlias() {
  ModuleAlias.addAlias('@libs', __dirname + '/libs')
  ModuleAlias.addAlias('@config', __dirname + '/config')
  ModuleAlias.addAlias('@apps', __dirname + '/apps')
  ModuleAlias.addAlias('@cores', __dirname + '/cores')
})()
