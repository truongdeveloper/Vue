<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { createReusableTemplate } from '@vueuse/core'
import { ArrowUpDown, MoreHorizontal, Copy } from 'lucide-vue-next'
import { computed, h, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

import { valueUpdater } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, MessageCircle, MessageCircleOff } from 'lucide-vue-next'
import {
  AlertDialog, AlertDialogContent,
  AlertDialogHeader, AlertDialogDescription, AlertDialogFooter,
  AlertDialogTitle, AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { deleteUser, getAllUsers, type IUser } from '@/services/userService'
import { toast } from 'vue-sonner'
import DialogEditUser from '@/components/common/DialogEditUser.vue'
import { useAuth } from '@/stores/useAuth'
import DialogCreateUser from '@/components/common/DialogCreateUser.vue'
import { useWebsocket } from '@/composables/useWebsocket'


const auth = useAuth();
const userData = ref<IUser[]>([]);
const total = ref<number>(0);
const pagination = reactive<{ pageIndex: number, pageSize: number }>({
  pageIndex: 0,
  pageSize: 50
})

const socket = useWebsocket('ws://localhost:3001')

function handleOpenChatMessage() {
  socket.connect();
  listenChat.value = true;
}

function handleCloseChatMessage() {
  socket.disconnect();
  listenChat.value = false;
}

// Watch message mới → log + toast
watch(
  socket.messages,
  (newMessages) => {
    if (newMessages.length) {
      console.log(newMessages)
      const latest = newMessages[newMessages.length - 1]
      toast.success(latest.d, {
        position: 'bottom-right',
        closeButton: false,
        richColors: true,
      })
    }
  },
  { deep: true }
)

watch(
  () => socket.isConnected.value,
  (connected) => {
    if (connected) {
      console.log('Connected – sending initial message')
      socket.send('event', '')
    }
  }
)

onMounted(async () => {
})

async function fetchUser(pageIndex: number, pageSize: number) {
  try {
    console.log(pageIndex, pageSize)
    const response: any = await getAllUsers(pageIndex, pageSize);
    if (response.ok) {
      userData.value = response.d.data;
      total.value = response.d.total;
    }
  } catch (error: any) {
    toast.error("Lấy User thất bại", { description: error?.message })
  }
}

watch(() => [pagination.pageIndex, pagination.pageSize], () => fetchUser(pagination.pageIndex, pagination.pageSize), { immediate: true })

onUnmounted(() => {
  socket.disconnect()
})

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  user: {
    id: string
  }
  onExpand: () => void
}>()

const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => h('div', { class: 'capitalize lg:w-[56px] md:w-[56px] text-center' }, row.getValue('id')),
  },
  {
    accessorKey: 'fistName',
    header: 'First Name',
    cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('fistName')),
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('lastName')),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Email', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('email')),
  },
  {
    accessorKey: 'role',
    header: () => h('div', { class: 'text-center' }, 'Role'),
    cell: ({ row }) => {
      const role = row.getValue('role');
      if (role === "ADMIN") {
        return h(Badge, { variant: 'secondary', class: "bg-blue-500 text-white" }, () => role)
      }
      return h(Badge, { variant: 'outline' }, () => role ?? '---')
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: "Action",
    cell: ({ row }) => {
      const user = row.original
      return h(ReuseTemplate, {
        user,
        onExpand: row.toggleExpanded,
      })
    },
  },
]

if (auth.isAdmin) {
  columns.splice(columns.length - 2, 0, {
    accessorKey: 'password',
    header: () => h('div', { class: 'text-center w-[100px]' }, 'Password'),
    cell: ({ row }) => h(Badge, { variant: 'outline', class: 'capitalize w-[100px] block text-ellipsis truncate whitespace-nowrap' }, row.getValue('password')),

  })
}

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const openDialogDelete = ref<boolean>(false);
const openDialogEdit = ref<boolean>(false);
const openDialogCreate = ref<boolean>(false);
const refId = ref<any>();
const refUser = ref<any>();
const listenChat = ref<boolean>();



const table = useVueTable({
  data: userData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  
  state: {  
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
  },
})

function copy(user: any) {
  navigator.clipboard.writeText(JSON.stringify(user))
}

function handleOpenDialogDelete(id: string) {
  refId.value = id;
  openDialogDelete.value = true;
}

function handleEditUser(user: any) {
  refUser.value = user;
  openDialogEdit.value = true;
}
function handleCloseEditDialog() {
  openDialogEdit.value = false;
}

function handleCloseCreateDialog() {
  openDialogCreate.value = false;
}

function handleOpenCreateDialog() {
  openDialogCreate.value = true;
}


function updateUsers(userUpdate: any) {
  userData.value = userData.value.filter(user => user.id !== userUpdate.id)
  userData.value = [userUpdate, ...userData.value];
}

async function handleDeleteUser() {
  try {
    const response: any = await deleteUser(refId.value);
    if (response && response.ok) {
      toast.success('Xóa User thành công')
      userData.value = userData.value.filter(user => user.id !== refId.value)
    }
  } catch (error: any) {
    toast.error("Lỗi không xóa được User", {
      description: error?.message
    })
  }
  openDialogDelete.value = false;
}
</script>

<template>
  <div class="w-full flex items-center justify-center h-screen">
    <div class="min-w-3xl">
      <DefineTemplate v-slot="{ user }">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-8 w-8 p-0">
              <span class="sr-only">Mở menu</span>
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="copy(user)" class="cursor-pointer">
              <Copy />
              Copy Json
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer" @click="handleEditUser(user)">
              <Pencil />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer" @click="handleOpenDialogDelete(user.id)">
              <Trash2 class="text-red-600" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DefineTemplate>
      <div class="w-full">
        <div class="flex items-center py-4 gap-4">
          <Button @click="handleOpenCreateDialog"
            class="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500  shadow-lg hover:shadow-purple-500/50">
            <Plus />
            Thêm user
          </Button>
          <Button v-if="!listenChat" @click="handleOpenChatMessage"
            class="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-linear-to-r from-green-500 via-red-500 to-yellow-500  shadow-lg hover:shadow-purple-500/50">
            <MessageCircle />
            Chat
          </Button>
          <Button v-if="listenChat" @click="handleCloseChatMessage"
            class="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-linear-to-r from-green-500 via-red-500 to-yellow-500  shadow-lg hover:shadow-purple-500/50">
            <MessageCircleOff />
            Tắt Chat
          </Button>
        </div>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead v-for="header in headerGroup.headers" :key="header.id" class="text-center">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                    :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="table.getRowModel().rows?.length">
                <template v-for="row in table.getRowModel().rows" :key="row.id">
                  <TableRow class="hover:bg-stone-200 transition-none">
                    <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id"
                      class="max-w-50 overflow-hidden text-center">
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="row.getIsExpanded()">
                    <TableCell :colspan="row.getAllCells().length">
                      {{ JSON.stringify(row.original) }}
                    </TableCell>
                  </TableRow>
                </template>
              </template>

              <TableRow v-else>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div class="text-sm text-muted-foreground">
          Hiển thị {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}
          đến {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            userData.length) }}
          của {{ userData.length }} kết quả
        </div>
        <div class="flex items-center justify-end space-x-2 py-4">

          <div class="space-x-2">
            <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
              Trước
            </Button>
            <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AlertDialog v-model:open="openDialogDelete">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Bạn chắc chắn muốn xóa?</AlertDialogTitle>
        <AlertDialogDescription>
          Hành động này không thể quay trở lại. Toàn bộ tài khoản và thông tin người dùng sẽ bị xóa vĩnh viễn trên hệ
          thống!
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="cursor-pointer">Giữ lại</AlertDialogCancel>
        <Button class="text-white bg-red-500 cursor-pointer" @click.prevent @click="handleDeleteUser">Xóa</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <Dialog v-model:open="openDialogEdit">
    <DialogContent :show-close-button="false" class="p-0 m-0">
      <DialogEditUser @close="handleCloseEditDialog" @response="updateUsers" :user="refUser" />
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="openDialogCreate">
    <DialogContent :show-close-button="false" class="p-0 m-0">
      <DialogCreateUser @close="handleCloseCreateDialog" @response="updateUsers" />
    </DialogContent>
  </Dialog>
</template>
