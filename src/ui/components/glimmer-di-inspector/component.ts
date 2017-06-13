import Component, { tracked } from "@glimmer/component";
import { deserializeSpecifier } from "@glimmer/di";
import getModuleSpecifier from "@glimmer/resolution-map-builder/lib/get-module-specifier";
import getModuleConfig from "@glimmer/resolution-map-builder/lib/get-module-config";
import resolverConfiguration from '../../../../config/resolver-configuration';

let config = getModuleConfig(resolverConfiguration);

export default class GlimmerDiInspector extends Component {
  @tracked filePath = 'src/ui/components/glimmer-inspector/template.hbs';

  @tracked('filePath')
  get specifier() {
    let path = this.filePath;

    if (path.match(/^src\//)) {
      path = path.replace(/^src\//, '');
    }

    let name = path.substring(0, path.lastIndexOf('.'));
    let ext = path.substring(path.lastIndexOf('.'));
    try {
      return getModuleSpecifier('app', config, name, ext);
    } catch (e) {
      return "ERR! " + e.toString();
    }
  }

  @tracked('specifier')
  get specifierJSON() {
    let json = deserializeSpecifier(this.specifier);
    return JSON.stringify(json, null, 2);
  }

  onSpecifierChange(event) {
    // this.specifier = event.target.value;
  }

  onFilePathChange(event) {
    this.filePath = event.target.value;
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
