<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import InputCustom from '@/components/common/InputCustom.vue'
import { createUser, type IUser } from '@/services/userService'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, Select, SelectLabel } from '@/components/ui/select'

const emit = defineEmits<{
  close: []
  response: [user: IUser]  // ← Bắn user mới tạo lên cha
}>()

// Schema validate cho tạo user mới (password bắt buộc)
const createSchema = toTypedSchema(
  zod.object({
    fistName: zod.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
    lastName: zod.string().min(2, { message: 'Họ phải có ít nhất 2 ký tự' }),
    email: zod.string().email({ message: 'Email không hợp lệ' }),
    password: zod.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    role: zod.string({ message: 'Role không hợp lệ' }),
  })
)

const form = useForm({
  validationSchema: createSchema,
  initialValues: {
    fistName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
  },
})
const [role, roleAttrs] = form.defineField('role', { validateOnModelUpdate: true })

const isLoading = ref(false)

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  try {
    const response: any = await createUser(values as any)
    if (response && response.ok) {
      toast.success(`Tạo user thành công: ${values.email}`)

      emit('response', response.d)
      emit('close')
    } else {
      toast.error(response.e.message || 'Tạo user thất bại')
    }
  } catch (error: any) {
    toast.error(error?.message || 'Có lỗi xảy ra khi tạo user')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <form @submit.prevent="onSubmit" class="flex w-full">
      <Card class="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Tạo người dùng mới</CardTitle>
          <CardDescription>
            Điền thông tin để tạo tài khoản người dùng mới
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <div class="grid w-full items-center gap-4">
              <div class="grid grid-cols-2 gap-4">
                <InputCustom name="fistName" :form="form" label="Tên" placeholder="Ví dụ: Anh" />
                <InputCustom name="lastName" :form="form" label="Họ" placeholder="Ví dụ: Nguyễn" />
              </div>

              <InputCustom name="email" :form="form" label="Email" placeholder="example@gmail.com" />

              <InputCustom name="password" :form="form" label="Mật khẩu" type="password"
                placeholder="Ít nhất 6 ký tự" />
              <Select v-model="role" v-bind="roleAttrs" default-value="USER">
                <SelectTrigger class="w-45">
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="ADMIN">
                      Admin
                    </SelectItem>
                    <SelectItem value="USER">
                      User
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter class="flex flex-row justify-between gap-5">
          <Button type="button" variant="outline" class="flex-1" @click="$emit('close')">
            Hủy
          </Button>

          <Button type="submit" class="flex-2 text-white hover:bg-green-600" :disabled="isLoading">
            <Spinner v-if="isLoading" class="mr-2" />
            Tạo user
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>