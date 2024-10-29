{
    'name': "Awesome Dashboard",
    'author': "jatin",
    'version': '0.1',
    'application': True,
    'installable': True,
    'depends': ['base', 'web', 'mail', 'crm'],
    'data': [
        'views/views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'awesome_dashboard/static/src/**/*',
        ],
    },
    'license': 'AGPL-3'
}
