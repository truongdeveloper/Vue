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
import { ref } from 'vue'
import { Eye, EyeClosed } from 'lucide-vue-next'

const registerSchema = toTypedSchema(
  zod.object({
    fistName: zod.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
    lastName: zod.string().min(2, { message: 'Họ phải có ít nhất 2 ký tự' }),
    email: zod.string().email("Email có dạng email"),
    password: zod.string()
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
        { message: 'Mật khẩu phải chứa ít nhất 1 ký tự hoa, 1 số và 1 ký tự đặc biệt' }
      ),
    rePassword: zod.string(),
  })
  .refine((data) => (data.password === data.rePassword), {
    message: "Mật khẩu xác nhận không khớp",
    path: ['rePassword'],
  })
);

// --- 2. STATE VÀ HOOKS ---
const showPass = ref(false);

const form = useForm({
  validationSchema: registerSchema,
  initialValues: {
    fistName: '',
    lastName: '',
    email: '',
    password: '',
    rePassword: ''
  },
})

const [password, passwordAttrs] = form.defineField('password', { validateOnModelUpdate: true })
const [rePassword, rePasswordAttrs] = form.defineField('rePassword', { validateOnModelUpdate: true })

const onSubmit = form.handleSubmit((data: any) => {
  console.log('--- Dữ liệu Đăng Ký Hợp Lệ ---');
  console.log(data);
  alert('Đăng ký thành công! Dữ liệu đã được log ra console.');
  
})

const handleTogglePass = () => {
  showPass.value = !showPass.value;
}

</script>

<template>
  <div>
    <form @submit="onSubmit" class="flex w-full items-center justify-center h-screen">
      <Card class="w-full max-w-lg"> <CardHeader>
          <CardTitle>Tạo Tài Khoản Mới</CardTitle>
          <CardDescription>
            Nhập thông tin của bạn để đăng ký
          </CardDescription>
          <CardAction>
            <Button variant="link" @click="$router.push('/login')">
              Đã có tài khoản? Đăng nhập
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div class="grid w-full items-center gap-4">
              <div class="grid grid-cols-2 gap-4">
                <InputCustom name="fistName" :form="form" label="Tên" placeholder="Ví dụ: Anh"></InputCustom>
                <InputCustom name="lastName" :form="form" label="Họ" placeholder="Ví dụ: Nguyễn"></InputCustom>
              </div>

              <InputCustom name="email" :form="form" label="Email" placeholder="example@gmail.com"></InputCustom>
              
              <div class="flex flex-col space-y-1.5">
                <Field>
                  <FieldLabel for="password">Mật khẩu</FieldLabel>
                  <div class="flex items-center relative">
                    <Input 
                      v-model="password" 
                      v-bind="passwordAttrs" 
                      id="password" 
                      class="pr-12" 
                      :type="showPass ? 'text' : 'password'" 
                    />
                    <component 
                      :is="showPass ? Eye : EyeClosed"
                      class="absolute right-3 size-6 text-stone-600 cursor-pointer" 
                      @click="handleTogglePass" 
                    />
                  </div>
                  <FieldError v-if="form.errors.value['password'] && form.submitCount.value > 0">
                    {{ form.errors.value['password'] }}
                  </FieldError>
                </Field>
              </div>

              <div class="flex flex-col space-y-1.5">
                <Field>
                  <FieldLabel for="rePassword">Xác nhận Mật khẩu</FieldLabel>
                  <div class="flex items-center relative">
                    <Input 
                      v-model="rePassword" 
                      v-bind="rePasswordAttrs" 
                      id="rePassword" 
                      class="pr-12" 
                      :type="showPass ? 'text' : 'password'" 
                    />
                  </div>
                  <FieldError v-if="form.errors.value['rePassword'] && form.submitCount.value > 0">
                    {{ form.errors.value['rePassword'] }}
                  </FieldError>
                </Field>
              </div>

            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <Button type="submit" class="w-full">
            Đăng ký
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>