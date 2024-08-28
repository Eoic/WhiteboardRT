use std::time::Duration;
use tokio::time;
use futures::SinkExt;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures::StreamExt;
use tokio_tungstenite::tungstenite::Message;

#[tokio::main]
async fn main() {
    let address = "127.0.0.1:6789";
    let listener = TcpListener::bind(address).await.unwrap();

    println!("WebSocket server is running on ws://{address}.");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_client(stream));
    }
}

async fn handle_client(stream: tokio::net::TcpStream) {
    let socket_stream = accept_async(stream).await.unwrap();
    let (mut write, mut read) = socket_stream.split();

    tokio::spawn(async move {
        let mut interval = time::interval(Duration::from_secs(1));
        
        loop {
            let message = "Ping".to_string();
            interval.tick().await;

            if write.send(Message::Text(message)).await.is_err() {
                break;
            }
        }
    });

    while let Some(Ok(message)) = read.next().await {
        handle_message(message).await;
    }
}

async fn handle_message(message: Message) {
    match message {
        Message::Close(_) => println!("Client disconnected"),
        Message::Text(content) => println!("Received: {content}."),
        _ => println!("Reseived message of unsupported type.")
    }
}