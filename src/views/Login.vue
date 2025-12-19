<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup, Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import InputCustom from '@/components/common/InputCustom.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { ref } from 'vue'
import { Eye, EyeClosed } from 'lucide-vue-next'
import { login, userInfo } from '@/services/authService'
import { useAuth } from '@/stores/useAuth'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'


const fieldSchema = toTypedSchema(zod.object({
  email: zod.string().email("Email có dạng email"),
  password: zod.string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/,
      { message: 'Mật khẩu phải chứa ít nhất 1 ký tự hoa, 1 số và 1 ký tự đặc biệt' }
    )
}))
const showPass = ref(false);
const isLoading = ref(false);
const auth = useAuth();
const router = useRouter();

const form = useForm({
  validationSchema: fieldSchema,
  initialValues: {
    email: 'vanminhtruong67@gmail.commm',
    password: '123456@Truong'
  },
})
const [password, passwordAttrs] = form.defineField('password', { validateOnModelUpdate: true })
const onSubmit = form.handleSubmit(async (data: any) => {
  isLoading.value = true;
  try {
    const response = await login(data.email, data.password);
    if (response.ok) {
      auth.login(response.d.access_token, response.d.refresh_token)
      const user = await userInfo();
      auth.setUser(user.d)
      toast.success("Xin Chào" + user.d.fistName)
      router.push('/')
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false;
  }

})

const handleShowPass = () => {
  showPass.value = !showPass.value;
}
</script>

<template>
  <div>
    <form @submit="onSubmit" class="flex w-full items-center justify-center h-screen">
      <Card class="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng nhập vào tài khoản</CardTitle>
          <CardDescription>
            Nhâp email và mật khẩu bên dưới
          </CardDescription>
          <CardAction>
            <Button variant="link">
              Đăng ký
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div class="grid w-full items-center gap-4">
              <div class="flex flex-col space-y-1.5">
                <InputCustom name="email" :form="form" label="Email" placeholder="example@gmail.com"></InputCustom>
              </div>
              <div class="flex flex-col space-y-1.5">
                <Field>
                  <FieldLabel for="password">Password</FieldLabel>
                  <div class="flex items-center relative">
                    <Input v-model="password" v-bind="passwordAttrs" id="password" class="pr-12"
                      :type="showPass ? '' : 'password'" />
                    <Eye v-if="showPass" class="absolute right-3 size-6 text-stone-600 cursor-pointer"
                      @click="handleShowPass" />
                    <EyeClosed v-if="!showPass" class="absolute right-3 size-6 text-stone-600 cursor-pointer"
                      @click="handleShowPass" />
                  </div>
                  <FieldError v-if="form.errors.value['password'] && form.submitCount.value > 0">{{
                    form.errors.value['password'] }}</FieldError>
                </Field>
              </div>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <Button type="submit" class="w-full" :disabled="isLoading">
            <Spinner class="animate-spin" v-if="isLoading" />
            Đăng nhập
          </Button>
        </CardFooter>
      </Card>
    </form>

  </div>
</template>
