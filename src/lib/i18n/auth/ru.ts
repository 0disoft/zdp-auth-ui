import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Войти",
    "signup": "Создать аккаунт",
    "recovery": "Восстановить аккаунт"
  },
  "summary": {
    "login": "Продолжите с аккаунтом 8ailors.",
    "signup": "Создайте аккаунт 8ailors.",
    "recovery": "Мы отправим инструкции по восстановлению на вашу электронную почту."
  },
  "fields": {
    "loginId": "Логин",
    "email": "Электронная почта",
    "password": "Пароль",
    "name": "Имя",
    "termsAcceptance": "Я принимаю обязательные условия.",
    "passwordConfirmation": "Подтверждение пароля",
    "minimumAgeConfirmation": "Я подтверждаю, что мне не менее {minimumAge} лет."
  },
  "actions": {
    "login": "Войти",
    "signup": "Создать аккаунт",
    "recovery": "Получить письмо для восстановления",
    "usePasskey": "Продолжить с ключом доступа",
    "showPassword": "Показать пароль",
    "hidePassword": "Скрыть пароль"
  },
  "providers": {
    "groupLabel": "Выберите способ входа",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Электронная почта"
  },
  "navigation": {
    "accountHelp": "Помощь с аккаунтом"
  },
  "links": {
    "login": "У меня уже есть аккаунт",
    "signup": "Создать новый аккаунт",
    "recovery": "Я забыл пароль",
    "terms": "Условия",
    "privacy": "Конфиденциальность"
  },
  "status": {
    "waiting": "Проверяем.",
    "error": "Проверьте данные и повторите попытку."
  },
  "availability": {
    "preparing": "Сервис аккаунтов пока недоступен."
  },
  "feedback": {
    "registered": "Аккаунт создан. Войдите, чтобы продолжить.",
    "invalidInput": "Проверьте введённые данные.",
    "expiredPage": "Срок действия страницы истёк. Обновите её и повторите попытку.",
    "signupUnavailable": "Создание аккаунта временно недоступно. Повторите попытку позже.",
    "loginFailed": "Проверьте логин и пароль.",
    "loginUnavailable": "Вход временно недоступен. Повторите попытку позже.",
    "passwordMismatch": "Пароли не совпадают."
  },
  "productLink": {
    "title": "Connect desktop product",
    "summary": "Review the product and what it is asking to use.",
    "fields": {
      "product": "Requesting product",
      "account": "Account",
      "workspace": "Workspace",
      "expires": "Request expires"
    },
    "requestedTitle": "Requested access",
    "itemKinds": {
      "scope": "Scope",
      "capability": "Capability"
    },
    "consentTitle": "If you approve",
    "consentBoundary": "This approval does not sync product data.",
    "noWorkspace": "Personal account",
    "actions": {
      "approve": "Approve connection",
      "deny": "Deny"
    },
    "status": {
      "ready": "You can approve or deny this request.",
      "submitting": "Sending your decision.",
      "approved": "Connection approved.",
      "denied": "Connection denied.",
      "expired": "This request expired. Start again from the desktop product.",
      "consumed": "This request was already used. Check the desktop product for its status.",
      "stale": "This request is out of date. Start again from the desktop product.",
      "invalid": "This connection request is not trusted. Start again from the desktop product.",
      "disabled": "Desktop product connection is not available yet."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
