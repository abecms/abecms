define({
	capabilities: {
		'browserstack.selenium_version': '2.45.0'
	},
	environments: [{ browserName: 'chrome' }],
	maxConcurrency: 2,
	tunnel: 'NullTunnel',
	suites: [],
	functionalSuites: [ 'tests/functional/index' ],
	excludeInstrumentation: /^(?:tests|test|node_modules)\//
});
