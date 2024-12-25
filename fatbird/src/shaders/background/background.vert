// Vertex shader
in vec2 aPosition;
out vec2 vTextureCoord;

void main(void)
{
    vTextureCoord = aPosition;
    gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);
}