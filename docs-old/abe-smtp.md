# Configure your SMTP server

## Introduction

Abe includes configuration to send emails. You can use:
- direct smtp
- SMTP configuration
- Amazon SES
- Mailchimp (mandrill)
- Sendgrid
- Mailgun

## How to

In the `abe.json` "smtp" entry, update the configuration with the infos of your mail provider:

### Direct SMTP

```
"smtp": null
```

It will send direct mails. This configuration is perfect for development.

### SMTP

```json
"smtp": {
    "service": "smtp",
    "options": {
    }
}
```

### Amazon SES

```json
"smtp": {
    "service": "ses",
    "options": {
        "host": "your host (ie. email-smtp.eu-west-1.amazonaws.com)",
        "secureConnection": true,
        "port": 465,
        "auth": {
            "user": "your_user",
            "pass": "your_password"
        }
    }
}
```

### Mailchimp (Mandrill)

```json
"smtp": {
    "service": "mandrill",
    "options": {
        "auth": {
            "apiKey": "your_mandrill_api_key"
        }
    }
}
```

### Sendgrid

```json
"smtp": {
    "service": "sendgrid",
    "options": {
        "auth": {
            "api_key": "SENDGRID_APIKEY"
        }
    }
}
```

### Mailgun

```json
"smtp": {
    "service": "mailgun",
    "options": {
        "auth": {
            "api_key" : "your_API_key",
            "domain": "your_domain"
        }
    }
}
```
