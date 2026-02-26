#!/bin/bash
# 胡祖源单词学习启动脚本
# 端口: 8888 (锁定)

PORT=8888
DIR="/Users/humengjie/胡祖源/word-app"

# 检查端口是否被占用
check_port() {
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        # 检查是否是单词学习服务
        if curl -s http://localhost:$PORT | grep -q "祖源"; then
            echo "✅ 祖源单词学习已在运行 (端口 $PORT)"
            return 0
        else
            echo "⚠️ 端口 $PORT 被其他程序占用！"
            echo "请手动释放端口后再启动"
            return 1
        fi
    fi
    return 2
}

# 启动服务
start_service() {
    echo "🚀 启动祖源单词学习..."
    cd "$DIR"
    nohup python3 -m http.server $PORT > /tmp/zuyuan-word.log 2>&1 &
    sleep 1
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "✅ 启动成功！"
        echo "📖 访问地址: http://localhost:$PORT"
    else
        echo "❌ 启动失败"
    fi
}

# 主逻辑
case "$1" in
    start)
        check_port
        result=$?
        if [ $result -eq 0 ]; then
            exit 0
        elif [ $result -eq 1 ]; then
            exit 1
        else
            start_service
        fi
        ;;
    stop)
        echo "🛑 停止服务..."
        pkill -f "http.server $PORT"
        echo "✅ 已停止"
        ;;
    status)
        check_port
        ;;
    *)
        echo "用法: $0 {start|stop|status}"
        ;;
esac
