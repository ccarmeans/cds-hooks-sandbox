import React from 'react';

var format = v => JSON.stringify(v, null, 2).split(/\n/)

const FhirView = React.createClass({

  getInitialState(){
    return {
      additions: [],
      shouldHighlight: false,
      output: '',
    }
  },

  shouldComponentUpdate(nextProps){
    if (nextProps.all.get('decisions').get('serviceRequestBody') !== this.props.all.get('decisions').get('serviceRequestBody')) {
      return true;
    } else if (nextProps.isServiceViewEnabled !== this.props.isServiceViewEnabled) {
      return true;
    } else if (nextProps.isConsoleLogEnabled !== this.props.isConsoleLogEnabled) {
      return true;
    }
    return false;
  },

  componentWillReceiveProps(newProps) {
    var oldLines = format(this.props.all.get('decisions').get('serviceRequestBody'))
    var newLines = format(newProps.all.get('decisions').get('serviceRequestBody'))
    var diff = newLines.filter((l, ind) => oldLines.indexOf(l) === -1);
    if (this.state.additions.length !== 0) {
      this.setState({
        shouldHighlight: true
      });
    }
    this.setState({
      additions: diff
    });
  },

  componentDidUpdate() {
    if (this.state.additions.length === 0) {
      this.setState({shouldHighlight: true});
    }
  },

  componentWillUpdate(nextProps) {
    // Log any updates of CDS Service Context changes if logging is enabled
    var oldLines = format(this.props.all.get('decisions').get('serviceRequestBody'))
    var newLines = format(nextProps.all.get('decisions').get('serviceRequestBody'))
    var diff = newLines.filter((l, ind) => oldLines.indexOf(l) === -1);
    if (diff.length !== 0) {
      if (nextProps.isConsoleLogEnabled) {
        console.log(format(nextProps.all.getIn(['decisions', 'serviceRequestBody'])));
      }
    }
  },

  lineStyle(isAddition) {
    return isAddition && this.state.shouldHighlight ? "line fade-actual" : "line";
  },

  toggleConsoleLogOption() {
    // Log the current CDS Service Context in the console before toggling the console log option
    if (!this.props.isConsoleLogEnabled) {
      console.log(format(this.props.all.getIn(['decisions', 'serviceRequestBody'])));
    }
    this.props.toggleConsoleLog(!this.props.isConsoleLogEnabled);
  },

  showConsoleLogOption() {
    // If the CDS Service Context view is hidden, display the console log option
    if (!this.props.isServiceViewEnabled) {
      return 'log-console-show';
    }
    return 'log-console-hide';
  },

  render() {
    var additions = this.state.additions;
    var output = format(this.props.all.getIn(['decisions', 'serviceRequestBody'])).map((l, i) => (
      <div
        key={i}
        ref={i}
        className={this.lineStyle(additions.indexOf(l) !== -1)}> {l}
      </div>
    ));
    if (this.props.all.getIn(['decisions', 'serviceRequestBody'])){
      return (
        <div className={this.props.isServiceViewEnabled ? 'fhir-view fhir-view-visible' : 'fhir-view'}>
          <div className='context-options-container'>
            <label className={this.showConsoleLogOption()}>Log to console
              <input type="checkbox" onChange={this.toggleConsoleLogOption} checked={this.props.isConsoleLogEnabled} />
            </label>
            <a className="configure-fhir-view" onClick={this.clickShowHide}>CDS Service Request</a>
          </div>
          <pre className={this.props.isServiceViewEnabled ? '' : 'hidden'}>{output}</pre>
        </div>
      );
    } else {
      return (<div className="fhir-view fhir-view-visible"><pre className="fhir-text"><div className="line">(No CDS Hook <i>context resources</i> required.)</div></pre></div>)
    }
  },

  clickShowHide(){
    this.props.toggleServiceView(!this.props.isServiceViewEnabled);
  }

});

module.exports = FhirView;
