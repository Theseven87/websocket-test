<template>
  <div class="w-full h-full flex flex-col">
    <a-space>
      <span>链接地址</span>
      <a-input v-model:value="url" placeholder="链接地址" />
      <a-button type="primary" :disabled="isRunning" @click="connection">连接</a-button>
      <a-button type="primary" :disabled="!isRunning" @click="stopConnect">停止</a-button>
    </a-space>
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
</template>
<script setup lang="ts">
import { ref, Ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const ipcRenderer = window.electron.ipcRenderer

const url = ref('')
const isRunning = ref(false)
const sendMsgBody = ref('')
const msgList: Ref<{ msg: string; type: 1 | 2; time: string }[]> = ref([])
const messageType: Ref<'all' | 'arrive' | 'send'> = ref('all')
const messageKey = ref('')

onMounted(() => {
  url.value = localStorage.getItem('url') || ''
  onMessage()
})

const renderMsg = computed(() => {
  if (messageType.value === 'all') {
    return msgList.value.filter((item) => item.msg.includes(messageKey.value))
  } else if (messageType.value === 'arrive') {
    return msgList.value.filter((item) => item.type === 2 && item.msg.includes(messageKey.value))
  } else {
    return msgList.value.filter((item) => item.type === 1 && item.msg.includes(messageKey.value))
  }
})

const onMessage = () => {
  ipcRenderer.on('sendMsg2ClientPage', (event, msg: string) => {
    console.log(msg)
    if (msg === 'connected') {
      isRunning.value = true
    } else if (msg === 'disconnection') {
      isRunning.value = false
    } else {
      msgList.value.push({
        type: 2,
        time: dayjs().toString(),
        msg
      })
    }
  })
}

const connection = () => {
  localStorage.setItem('url', url.value)
  ipcRenderer.invoke('connectionWs', url.value)

}

const sendMsg = () => {
  msgList.value.push({
    type: 1,
    time: dayjs().toString(),
    msg: sendMsgBody.value
  })
  ipcRenderer.invoke('sendMessageToServer', sendMsgBody.value)
}

const stopConnect = () => {
  ipcRenderer.invoke('disconnection', sendMsgBody.value)
}
</script>
