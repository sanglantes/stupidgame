import asyncio
import websockets

connected_clients = set()

async def echo(websocket, path):
    connected_clients.add(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")
    
    try:
        async for message in websocket:
            for client in connected_clients:
                await client.send(message)
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(connected_clients)}")

async def main():
    async with websockets.serve(echo, "localhost", 5050):
        await asyncio.Future()

asyncio.run(main())
