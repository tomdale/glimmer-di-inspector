import Component, { tracked } from "@glimmer/component";
import { deserializeSpecifier } from "@glimmer/di";
import getModuleSpecifier from "@glimmer/resolution-map-builder/lib/get-module-specifier";
import getModuleConfig from "@glimmer/resolution-map-builder/lib/get-module-config";
import resolverConfiguration from '../../../../config/resolver-configuration';

let config = getModuleConfig(resolverConfiguration);

function pathFromURL() {
  let hash = window.location.hash.match(/path=(.*)/);
  if (hash) {
    return decodeURIComponent(hash[1]);
  }
}

export default class GlimmerDiInspector extends Component {
  constructor(options: any) {
    super(options);

    let path = pathFromURL();
    if (path) {
      this.filePath = path;
    }
  }

  @tracked filePath = 'src/ui/components/glimmer-inspector/template.hbs';

  @tracked('filePath')
  get specifier() {
    let { modulePrefix, moduleName, moduleExt } = parse(this.filePath);

    try {
      return getModuleSpecifier(modulePrefix, config, moduleName, moduleExt);
    } catch (e) {
      return "ERR! " + e.toString();
    }
  }

  @tracked('specifier')
  get specifierJSON() {
    let json = deserializeSpecifier(this.specifier);
    return JSON.stringify(json, null, 2);
  }

  onFilePathChange(event) {
    this.filePath = event.target.value.trim();
    window.location.hash = `path=${encodeURIComponent(this.filePath)}`;
  }

  @tracked showExamples = false;
  toggleExamples(event) {
    if (event.target.tagName === 'P') { return; }
    this.showExamples = !this.showExamples;
  }

  @tracked('showExamples')
  get examplesClass() {
    return this.showExamples ? 'show-examples' : null;
  }
}

// Checks for paths in the packages/ directory and matches:
//   1. Package name
//   2. Remaining path after package name
//
// E.g. "packages/tw-bootstrap/src/ui/components" captures
//   1. tw-bootstrap
//   2. src/ui/components
const RE_ADDON = /^packages\/([^\/]+)\/(.*)/;

function parse(path: string) {
  let modulePrefix = 'app';
  let moduleName = path;
  let moduleExt: string;

  // Strip off leading slash if provided
  // '/src/ui' -> 'src/ui'
  if (moduleName.charAt(0) === '/') {
    moduleName = moduleName.substr(1);
  }

  // If path is to a module in an addon, extract addon name and normalize path
  // relative to that
  if (RE_ADDON.test(moduleName)) {
    let remainder: string;
    [, modulePrefix, remainder] = moduleName.match(RE_ADDON);

    moduleName = remainder;
  }

  // Strip off leading 'src/`.
  moduleName = moduleName.replace(/^src\//, '');

  [moduleExt, moduleName] = extensionFor(moduleName);

  return {
    modulePrefix,
    moduleName,
    moduleExt
  }
}

function extensionFor(path: string): [string, string] {
  let parts = path.split('.');
  return [parts.pop(), parts.join('.')];
}
