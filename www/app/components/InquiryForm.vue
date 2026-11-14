<script setup lang="ts">
/**
 * One form component for contact, VIP and private-event requests.
 * Fields depend on `formType`; the backend schema (firebase/functions/src/models.ts) matches.
 * WebMCP: the <form> carries toolname/tooldescription and each field a toolparamdescription.
 */
const props = defineProps<{
  formType: 'contact' | 'vip' | 'private-event'
  toolName: string
  toolDescription: string
  /** Pre-select a night (e.g. arriving from the Latin Night page): 'fri' | 'sat'. */
  presetNight?: string
}>()

const { t, tm, rt } = useI18n()
const uid = useId()
const id = (n: string) => `${props.formType}-${uid}-${n}`
const { load: loadRecaptcha, token: recaptchaToken } = useRecaptcha()

const isVip = computed(() => props.formType === 'vip')
const isEvent = computed(() => props.formType === 'private-event')
const needsPhone = computed(() => isVip.value || isEvent.value)

const blank = () => ({
  name: '', email: '', phone: '', date: '', guests: '', occasion: '', eventType: '',
  mixers: '', signMessage: '', decor: false, terms: false, message: '', company: ''
})
const form = reactive(blank())
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const dateError = ref('')

const occasions = computed(() => (tm('Forms.occasions') as unknown[]).map(o => rt(o as Parameters<typeof rt>[0])))
const eventTypes = computed(() => (tm('Forms.eventTypes') as unknown[]).map(o => rt(o as Parameters<typeof rt>[0])))
const vipRules = computed(() => (tm('IndexPage.vipRules') as unknown[]).map(r => rt(r as Parameters<typeof rt>[0])))

// Today in yyyy-mm-dd (local), used as the date picker's minimum.
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

// VIP booths only run Friday and Saturday.
function checkDate() {
  dateError.value = ''
  if (!isVip.value || !form.date) return true
  const [y, m, d] = form.date.split('-').map(Number)
  const day = new Date(y!, m! - 1, d!).getDay()
  if (day !== 5 && day !== 6) {
    dateError.value = t('Forms.vipDateError')
    return false
  }
  return true
}

async function onSubmit() {
  if (!checkDate()) return
  status.value = 'sending'

  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(form)) {
    if (v === '' || v === false) continue
    data[k] = typeof v === 'boolean' ? 'Yes' : v
  }

  const result = await useSubmitForm(props.formType, data, await recaptchaToken(props.formType.replace('-', '_')).catch(() => undefined))
  if (result.success) {
    status.value = 'success'
    Object.assign(form, blank())
  } else {
    status.value = 'error'
  }
}

onMounted(() => {
  if (props.presetNight && isVip.value) {
    // Next Friday/Saturday as a starting suggestion.
    const target = props.presetNight === 'sat' ? 6 : 5
    const d = new Date()
    d.setDate(d.getDate() + ((target - d.getDay() + 7) % 7))
    form.date = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  }
})

const input = 'w-full rounded-lg border border-[#2c2930] bg-[#121114] px-4 py-3 text-base text-white placeholder:text-[#6f6a75] transition focus:border-hub-400 focus:ring-2 focus:ring-hub-400/40 focus:outline-none'
const label = 'mb-1.5 block font-display text-sm tracking-[0.12em] uppercase text-[#e6e3e8]'
const hint = 'mt-1.5 text-sm text-[#a39fa8]'
</script>

<template>
  <div v-if="status === 'success'" role="status" class="rounded-xl border border-hub-400/50 bg-night-card p-8 text-center">
    <UIcon name="i-lucide-party-popper" class="mx-auto mb-4 size-12 text-hub-400" />
    <h3 class="mb-2 text-3xl font-bold">{{ t(`Forms.success.${formType}.title`) }}</h3>
    <p class="text-[#c4c0c8]">{{ t(`Forms.success.${formType}.body`) }}</p>
    <button type="button" class="btn-pill btn-ghost mt-6 !min-h-12" @click="status = 'idle'">{{ t('Forms.another') }}</button>
  </div>

  <!-- WebMCP Declarative API: exposes this form as a structured tool for browser agents -->
  <form
    v-else
    class="flex flex-col gap-5"
    :toolname="toolName"
    :tooldescription="toolDescription"
    @submit.prevent="onSubmit"
    @focusin.once="loadRecaptcha()"
  >
    <!-- Honeypot: hidden from people, irresistible to bots. The backend drops anything that fills it. -->
    <div class="absolute -left-[9999px]" aria-hidden="true">
      <label :for="id('company')">Company</label>
      <input :id="id('company')" v-model="form.company" name="company" type="text" tabindex="-1" autocomplete="off">
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label :for="id('name')" :class="label">{{ isVip ? t('Forms.hostName') : t('Forms.name') }}</label>
        <input
:id="id('name')" v-model="form.name" name="name" type="text" required autocomplete="name"
          toolparamdescription="Full name of the person making the request" :class="input">
        <p v-if="isVip" :class="hint">{{ t('Forms.hostNameHint') }}</p>
      </div>
      <div>
        <label :for="id('phone')" :class="label">{{ needsPhone ? t('Forms.phone') : t('Forms.phoneOptional') }}</label>
        <input
:id="id('phone')" v-model="form.phone" name="phone" type="tel" :required="needsPhone" autocomplete="tel" inputmode="tel"
          toolparamdescription="Phone number for confirming the booking" :class="input">
      </div>
    </div>

    <div>
      <label :for="id('email')" :class="label">{{ t('Forms.email') }}</label>
      <input
:id="id('email')" v-model="form.email" name="email" type="email" required autocomplete="email"
        toolparamdescription="Email address to reply to" :class="input">
    </div>

    <div v-if="isVip || isEvent" class="grid gap-5 sm:grid-cols-2">
      <div>
        <label :for="id('date')" :class="label">{{ isVip ? t('Forms.vipDate') : t('Forms.date') }}</label>
        <input
:id="id('date')" v-model="form.date" name="date" type="date" :min="today" :required="isVip"
          :aria-invalid="!!dateError" :aria-describedby="id('date-hint')" toolparamdescription="Requested date (YYYY-MM-DD). VIP booths: Friday or Saturday only."
          :class="input" @change="checkDate">
        <p :id="id('date-hint')" :class="dateError ? 'mt-1.5 text-sm font-semibold text-hub-300' : hint" :role="dateError ? 'alert' : undefined">
          {{ dateError || (isVip ? t('Forms.vipDateHint') : t('Forms.dateHint')) }}
        </p>
      </div>
      <div>
        <label :for="id('guests')" :class="label">{{ t('Forms.guests') }}</label>
        <input
:id="id('guests')" v-model="form.guests" name="guests" type="number" min="1" max="500" inputmode="numeric" :required="isVip"
          toolparamdescription="Number of guests" :class="input">
      </div>
    </div>

    <template v-if="isVip">
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label :for="id('occasion')" :class="label">{{ t('Forms.occasion') }}</label>
          <select :id="id('occasion')" v-model="form.occasion" name="occasion" toolparamdescription="What the group is celebrating" :class="input">
            <option value="">{{ t('Forms.choose') }}</option>
            <option v-for="o in occasions" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div>
          <label :for="id('mixers')" :class="label">{{ t('Forms.mixers') }}</label>
          <input
:id="id('mixers')" v-model="form.mixers" name="mixers" type="text" :placeholder="t('Forms.mixersPlaceholder')"
            toolparamdescription="Two mixers for the bottles" :class="input">
        </div>
      </div>
      <div>
        <label :for="id('sign')" :class="label">{{ t('Forms.signMessage') }}</label>
        <input
:id="id('sign')" v-model="form.signMessage" name="signMessage" type="text" maxlength="60" :placeholder="t('Forms.signPlaceholder')"
          toolparamdescription="Short message for the bottle presentation sign" :class="input">
      </div>
      <label :for="id('decor')" class="flex cursor-pointer items-start gap-3 rounded-lg border border-[#2c2930] bg-[#121114] p-4">
        <input :id="id('decor')" v-model="form.decor" name="decor" type="checkbox" class="mt-1 size-5 accent-[#e8337a]" toolparamdescription="Add booth decoration for $120">
        <span>
          <span class="block font-semibold">{{ t('Forms.decor') }}</span>
          <span class="text-sm text-[#a39fa8]">{{ t('Forms.decorHint') }}</span>
        </span>
      </label>
    </template>

    <div v-if="isEvent">
      <label :for="id('eventType')" :class="label">{{ t('Forms.eventType') }}</label>
      <select :id="id('eventType')" v-model="form.eventType" name="eventType" toolparamdescription="Kind of private event" :class="input">
        <option value="">{{ t('Forms.choose') }}</option>
        <option v-for="o in eventTypes" :key="o" :value="o">{{ o }}</option>
      </select>
    </div>

    <div>
      <label :for="id('message')" :class="label">{{ isVip ? t('Forms.notesOptional') : t('Forms.message') }}</label>
      <textarea
:id="id('message')" v-model="form.message" name="message" rows="4" :required="!isVip"
        :aria-describedby="id('message-hint')" toolparamdescription="Anything else we should know" :class="input" />
      <p :id="id('message-hint')" :class="hint">{{ t(`Forms.messageHint.${formType}`) }}</p>
    </div>

    <div v-if="isVip" class="rounded-lg border border-[#2c2930] bg-night-raised p-5">
      <p class="mb-3 font-display text-sm tracking-[0.14em] uppercase">{{ t('IndexPage.vipRulesTitle') }}</p>
      <ul class="mb-4 list-disc space-y-1 pl-5 text-sm text-[#c4c0c8]">
        <li v-for="r in vipRules" :key="r">{{ r }}</li>
        <li>{{ t('Forms.ruleId') }}</li>
      </ul>
      <label :for="id('terms')" class="flex cursor-pointer items-start gap-3">
        <input :id="id('terms')" v-model="form.terms" name="terms" type="checkbox" required class="mt-0.5 size-5 accent-[#e8337a]" toolparamdescription="Agree to the VIP booth terms">
        <span class="text-sm font-semibold">{{ t('Forms.terms') }}</span>
      </label>
    </div>

    <button type="submit" class="btn-pill btn-pink w-full disabled:opacity-60 sm:w-auto sm:self-start" :disabled="status === 'sending'">
      <UIcon v-if="status === 'sending'" name="i-lucide-loader-circle" class="size-5 animate-spin" />
      {{ status === 'sending' ? t('Forms.sending') : t(`Forms.submit.${formType}`) }}
    </button>

    <!-- Required by Google when the floating reCAPTCHA badge is hidden (see main.css). -->
    <p class="text-xs text-[#8f8a94]">
      {{ t('Forms.recaptcha') }}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" class="underline hover:text-white">{{ t('Forms.privacy') }}</a>
      {{ t('Forms.and') }}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener" class="underline hover:text-white">{{ t('Forms.terms_google') }}</a>
    </p>

    <p v-if="status === 'error'" role="alert" class="rounded-lg border border-hub-400/50 bg-hub-400/10 p-4 text-sm">
      {{ t('Forms.error') }}
      <a :href="`mailto:${SITE.email}`" class="font-semibold underline">{{ SITE.email }}</a>
    </p>
  </form>
</template>
