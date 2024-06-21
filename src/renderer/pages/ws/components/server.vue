<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex justify-between h-10">
      <a-space>
        <span>监听端口：</span>
        <a-input v-model:value="port" type="number" placeholder="监听的端口号" />
        <a-button type="primary" :disabled="isRunning" @click="connect">连接</a-button>
        <a-button type="primary" :disabled="!isRunning" @click="stopConnect">停止</a-button>
      </a-space>
    </div>
    <div class="flex flex-row mt-5 pb-5 flex-1">
      <div class="mr-5">
        <p>客户端列表</p>
        <a-list
          class="h-full w-32"
          size="small"
          item-layout="horizontal"
          :data-source="connectionList"
        >
          <template #renderItem="{ item }">
            <a-list-item>{{ item }}</a-list-item>
          </template>
        </a-list>
      </div>
      <div class="flex flex-col flex-1">
        <div>
          <a-space class="flex justify-end mb-2">
            <a-button type="primary" :disabled="!isRunning" @click="sendMsg">发送</a-button>
          </a-space>
          <a-textarea
            v-model:value="sendMsgBody"
            :auto-size="{ minRows: 3, maxRows: 3 }"
            placeholder="在此输入需要发送的消息"
            allow-clear
          />
        </div>
        <div class="flex flex-col mt-3 flex-1">
          <a-space class="flex justify-between mb-2">
            <div class="flex">
              <a-select ref="select" v-model:value="messageType">
                <a-select-option value="all">全部</a-select-option>
                <a-select-option value="arrive">接收</a-select-option>
                <a-select-option value="send">发送</a-select-option>
              </a-select>
              <a-input
                v-model:value="messageKey"
                class="ml-2"
                placeholder="输入关键字进行过滤"
              ></a-input>
            </div>
            <div>
              <a-button
                type="primary"
                @click="
                  () => {
                    msgList = []
                  }
                "
                >清除</a-button
              >
            </div>
          </a-space>
          <div class="flex-grow border border-gray-400 rounded-md p-3 overflow-y-auto h-5">
            <template v-for="(item, index) in renderMsg" :key="index">
              <!-- <div class="flex justify-between items-end"> -->
              <p class="mb-1">
                {{ item.type === 1 ? `---->发送消息:` : '<----接收消息:' }}--{{ item.time }}
              </p>
              <p class="break-all" v-text="item.msg"></p>
              <!-- </div> -->
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, Ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
// import { IpcEvents } from '../../../../common/ipcEvents'
const port: Ref<number | null> = ref(null)
const isRunning = ref(false)
const sendMsgBody = ref('')
const msgList: Ref<{ msg: string; type: 1 | 2; time: string }[]> = ref([])
const messageType: Ref<'all' | 'arrive' | 'send'> = ref('all')
const messageKey = ref('')

const connectionList: Ref<string[]> = ref([])
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const ipcRenderer = window.electron.ipcRenderer

const renderMsg = computed(() => {
  if (messageType.value === 'all') {
    return msgList.value.filter((item) => item.msg.includes(messageKey.value))
  } else if (messageType.value === 'arrive') {
    return msgList.value.filter((item) => item.type === 2 && item.msg.includes(messageKey.value))
  } else {
    return msgList.value.filter((item) => item.type === 1 && item.msg.includes(messageKey.value))
  }
})

onMounted(async () => {
  const res = await ipcRenderer.invoke('checkWsInstance')
  if (res) {
    port.value = res
    isRunning.value = true
  }

  onClinets()
  onMessage()
})

const onClinets = () => {
  ipcRenderer.on('clientsList', (event, msg: string[]) => {
    connectionList.value = [...msg]
  })
}

const onMessage = () => {
  ipcRenderer.on('sendMsg2ServerPage', (event, msg: string) => {
    console.log(msg)
    msgList.value.push({
      type: 2,
      time: dayjs().toString(),
      msg
    })
  })
}

const connect = () => {
  //   console.log(ipcRenderer)
  if (!port.value || isNaN(port.value) || port.value < 1 || port.value > 65535) {
    message.error('请先填写监听的端口！')
    return
  }

  try {
    ipcRenderer.invoke('startWebSocketServerAtPort', port.value)
    isRunning.value = true
  } catch (error) {
    console.error(error)
  }
}

const stopConnect = () => {
  ipcRenderer.invoke('stopWebSocketServer')
  isRunning.value = false
}

const sendMsg = () => {
  msgList.value.push({
    type: 1,
    time: dayjs().toString(),
    msg: sendMsgBody.value
  })
  ipcRenderer.invoke('sendMessageByWebsocket', sendMsgBody.value)
}
</script>
