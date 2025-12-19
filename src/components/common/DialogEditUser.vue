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
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import InputCustom from '@/components/common/InputCustom.vue'
import { updateUser, type IUser } from '@/services/userService';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { Spinner } from '../ui/spinner';

const props = defineProps<{
  user: IUser,
}>()
const emit = defineEmits(['close', 'response'])

const registerSchema = toTypedSchema(
  zod.object({
    fistName: zod.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
    lastName: zod.string().min(2, { message: 'Họ phải có ít nhất 2 ký tự' }),
    email: zod.string().email("Email có dạng email"),
    password: zod.string(),
    role: zod.string().min(1, { message: 'Role không hợp lệ' }),
  })
);

const form = useForm({
  validationSchema: registerSchema,
})


watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.resetForm({
        values: {
          fistName: newUser.fistName || '',
          lastName: newUser.lastName || '',
          email: newUser.email || '',
          password: newUser.password || '',
        },
      })
    } else {
      form.resetForm()
    }
  },
  { immediate: true }
)


const isLoading = ref<boolean>(false)
const onSubmit = form.handleSubmit(async (data: any) => {
  console.log(data)
  try {
    isLoading.value = true
    const res: any = await updateUser(props.user.id, data);
    if(res && res.ok) {
      toast.success("Cập nhật thành công User " + data.email)
      emit('response', {id: props.user.id, ...data})
      emit('close')
    }
  }catch(error) {
    toast.error("Lỗi không cập nhật User")
  }finally {
    isLoading.value = false
  }

})
</script>
<template>
  <div>
    <form @submit="onSubmit" class="flex w-full">
      <Card class="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Thay đổi thông tin người dùng</CardTitle>
          <CardDescription>
            Khi đã thay đổi thông tin người dùng không thể quay lại dữ liệu cũ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div class="grid w-full items-center gap-4">
              <div class="grid grid-cols-2 gap-4">
                <InputCustom name="fistName" :form="form" label="Tên" placeholder="Ví dụ: Anh"></InputCustom>
                <InputCustom name="lastName" :form="form" label="Họ" placeholder="Ví dụ: Nguyễn"></InputCustom>
              </div>
              <InputCustom name="email" :form="form" label="Email" placeholder="example@gmail.com"></InputCustom>
              <InputCustom :disable="true" name="password" :form="form" label="Password" placeholder=""></InputCustom>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter class="flex flex-row justify-between gap-4">
          <Button class="flex-1 text-white bg-red-500" @click="$emit('close')">
            Hủy
          </Button>
          <Button type="submit" class="flex-3 text-white bg-green-600" :disabled="isLoading">
            <Spinner v-if="isLoading"/>
            Lưu thay đổi
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>