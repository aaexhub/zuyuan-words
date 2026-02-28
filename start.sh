#!/bin/bash
# 胡祖源单词学习启动脚本
# 端口: 8888 (锁定)
# 支持局域网访问

PORT=8888
DIR="/Users/humengjie/胡祖源/word-app"

# 获取本机局域网IP
get_local_ip() {
    # 尝试多种方式获取IP
    local ip=""
    ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    if [ -z "$ip" ]; then
        ip=$(ipconfig getifaddr en0 2>/dev/null)
    fi
    if [ -z "$ip" ]; then
        ip="查看系统偏好设置→网络"
    fi
    echo "$ip"
}

# 检查端口是否被占用
check_port() {
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        # 检查是否是单词学习服务
        if curl -s http://localhost:$PORT | grep -q "词汇通"; then
            echo "✅ 英语词汇通已在运行 (端口 $PORT)"
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
    echo "🚀 启动英语词汇通..."
    cd "$DIR"
    # 监听 0.0.0.0 允许局域网访问
    nohup python3 -m http.server $PORT --bind 0.0.0.0 > /tmp/zuyuan-word.log 2>&1 &
    sleep 1
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "✅ 启动成功！"
        echo ""
        echo "📖 访问地址："
        echo "   本机: http://localhost:$PORT"
        echo "   局域网: http://$(get_local_ip):$PORT"
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
            echo ""
            echo "📖 访问地址："
            echo "   本机: http://localhost:$PORT"
            echo "   局域网: http://$(get_local_ip):$PORT"
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
        if [ $? -eq 0 ]; then
            echo ""
            echo "📖 访问地址："
            echo "   本机: http://localhost:$PORT"
            echo "   局域网: http://$(get_local_ip):$PORT"
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|status}"
        ;;
esac
