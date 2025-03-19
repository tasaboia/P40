import type { AbstractIntlMessages } from "next-intl";

export interface IntlMessages extends AbstractIntlMessages {
  common: {
    title: string;
    actions: {
      retry: string;
      back: string;
      next: string;
      submit: string;
      cancel: string;
      confirm: string;
      delete: string;
      edit: string;
      logout: string;
      daily_guidelines: string;
      occurrences: string;
      settings: string;
      language: string;
      save: string;
      close: string;
      search: string;
      filter: string;
      refresh: string;
      loading: string;
    };
    status: {
      loading: string;
      error: string;
      success: string;
      empty: string;
      saving: string;
      updating: string;
      deleting: string;
      no_data: string;
    };
    weekdays: {
      Sun: string;
      Mon: string;
      Tue: string;
      Wed: string;
      Thu: string;
      Fri: string;
      Sat: string;
    };
    profile_image: string;
    greeting: string;
    event_types: {
      SHIFT: string;
      CLOCK: string;
    };
    user: {
      my_data: string;
      profile: string;
      update_data: string;
      name: string;
      email: string;
      whatsapp: string;
      update_success: string;
      update_error: string;
    };
    validation: {
      required: string;
      email: string;
      min_length: string;
      max_length: string;
    };
    messages: {
      success: string;
      error: string;
      confirm: string;
      cancel: string;
    };
  };
  auth: {
    login: {
      title: string;
      email: string;
      email_placeholder: string;
      password: string;
      forgot_password: string;
      login_button: string;
      create_account: string;
      terms: string;
      login_with_provider: string;
      or_login_with_prover: string;
      show_password: string;
      invalid_credentials: string;
      server_error: string;
      network_error: string;
    };
    terms: {
      service: string;
      privacy: string;
    };
  };
  zion: {
    select: {
      title: string;
      loading: string;
      error: string;
      empty: string;
      regions: {
        BR: string;
        EU: string;
        NA: string;
        LATAM: string;
        GLOBAL: string;
      };
    };
  };
  prayer: {
    turns: {
      title: string;
      clock: string;
      max_leaders: string;
      empty: string;
      my_schedules: string;
      my_prayer_turns: string;
      no_schedules: string;
      at: string;
      actions: {
        join: string;
        leave: string;
      };
      messages: {
        subscribe: {
          success: string;
          success_desc: string;
          error: string;
          error_desc: string;
        };
        unsubscribe: {
          success: string;
          success_desc: string;
          error: string;
          error_desc: string;
        };
      };
      validation: {
        max_leaders: string;
        invalid_time: string;
        already_subscribed: string;
      };
    };
  };
  admin: {
    onboarding: {
      welcome: {
        title: string;
        description: string;
      };
      configurationTitle: string;
      configurationDescription: string;
      form: {
        dates: {
          start: {
            label: string;
            help: string;
          };
          end: {
            label: string;
            help: string;
          };
        };
        eventType: {
          label: string;
          placeholder: string;
          help: string;
          options: {
            SHIFT: string;
            CLOCK: string;
          };
        };
        maxParticipants: {
          label: string;
          placeholder: string;
          help: string;
        };
        shiftDuration: {
          label: string;
          placeholder: string;
          help: string;
          options: {
            oneHour: string;
            thirtyMinutes: string;
          };
        };
      };
      actions: {
        back: string;
        next: string;
        submit: string;
      };
    };
    dashboard: {
      tabs: {
        dashboard: string;
        schedule: string;
      };
      stats: {
        registeredLeaders: string;
        singleLeaderSlots: string;
        filledSlots: string;
        emptySlots: string;
      };
      chart: {
        title: string;
        description: string;
      };
      table: {
        search: string;
        columns: {
          name: string;
          whatsapp: string;
        };
        actions: {
          label: string;
          manage_schedules: string;
          allow_leave: string;
        };
        no_results: string;
        loading: string;
        error: string;
      };
    };
  };
  checkin: {
    title: string;
    description: string;
    status: string;
    actions: {
      back: string;
      submit: string;
    };
  };
  errors: {
    not_found: {
      title: string;
      description: string;
      message: string;
      home_button: string;
    };
    general: {
      title: string;
      description: string;
      unknown: string;
    };
  };
  setup: {
    choose_zion: string;
    enter_schedules: string;
  };
}
