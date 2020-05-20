#version 430

#define EPSILON  0.001
#define BIG  1000000.0

uniform vec3 BigSphere;				//способ отображения большой сферы
uniform vec3 ColBigSphere;			//цвет большой сферы
uniform vec3 SmallSphere;			//способ отображения маленькой сферы
uniform vec3 ColSmallSphere;		//цвет маленькой сферы
uniform vec3 Cub;					//способ отображения куба
uniform vec3 ColCub1;				//цвет 1 грани куба
uniform vec3 ColCub2;				//цвет 2 грани куба
uniform vec3 ColCub3;				//цвет 3 грани куба
uniform vec3 Tet;					//способ отображения тетраэдра
uniform vec3 ColTet1;				//цвет 1 грани тетраэдра
uniform vec3 ColTet2;				//цвет 2 грани тетраэдра

const int REFRACTION = 4;
const int DIFFUSE_REFLECTION = 1;
const int MIRROR_REFLECTION = 2;
out vec4 FragColor; 
in vec3 glPosition;

		/* DATA STRUCTURES */
struct SCamera	// камера
{
	vec3 Position;
	vec3 View;
	vec3 Up;
	vec3 Side;
	// отношение сторон выходного изображения
	vec2 Scale;
};

struct SRay	//луч
{
	vec3 Origin;
	vec3 Direction;
};

struct SLight	// источник света
{
	vec3 Position;
};


struct SSphere	// сфера
{
	vec3 Center;
	float Radius;
	int MaterialIdx;
};

struct SKub	// куб
{
	vec3 v1;
	vec3 v2;
	vec3 v3;
	int MaterialIdx;
};

struct SThetr	// тетраэдр
{
	vec3 v1;
	vec3 v2;
	vec3 v3;
	int MaterialIdx;
};

struct STriangle	// треугольник
{
	vec3 v1;
	vec3 v2;
	vec3 v3;
	int MaterialIdx;
};

struct SIntersection	//пересечение
{
	float Time;
	vec3 Point;
	vec3 Normal;
	vec3 Color;
	// ambient, diffuse and specular coeffs
	vec4 LightCoeffs;
	// 0 - non-reflection, 1 - mirror
	float ReflectionCoef;
	float RefractionCoef;
	int MaterialType;
};

struct SMaterial	// материал
{
	//diffuse color
	vec3 Color;
	// ambient, diffuse and specular coeffs
	vec4 LightCoeffs;
	// 0 - non-reflection, 1 - mirror
	float ReflectionCoef;
	float RefractionCoef;
	int MaterialType;
};

struct STracingRay	//
{
	SRay ray;			// луч
	float contribution;	//хранение вклада луча в результирующий цвет
	int depth;			//номер переотражения, после которого этот луч был создан
};

SRay GenerateRay ( SCamera uCamera )
{
	vec2 coords = glPosition.xy * uCamera.Scale;
	vec3 direction = uCamera.View + uCamera.Side * coords.x + uCamera.Up * coords.y;
	return SRay ( uCamera.Position, normalize(direction) );
}
SCamera initializeDefaultCamera()
{
	SCamera camera;
	//** CAMERA **//
	camera.Position = vec3(0.0, 0.0, -8.0);
	camera.View = vec3(0.0, 0.0, 1.0);
	camera.Up = vec3(0.0, 1.0, 0.0);
	camera.Side = vec3(1.0, 0.0, 0.0);
	camera.Scale = vec2(1.0);
	return camera;
}

SSphere spheres[2];
SKub kubs[12];
SThetr thetrs[4];
STriangle triangles[10];
SLight ulight;
SMaterial materials[13];

void initializeDefaultLightMaterials(out SLight light)
{
	//** LIGHT **//
	light.Position = vec3(0.0, 4.0, 0);
	/** MATERIALS **/
	vec4 lightCoefs = vec4(0.4,0.9,0.0,512.0);

	materials[0].Color = ColSmallSphere;			//материал для маленького шарика	
	materials[0].LightCoeffs = vec4(lightCoefs);
	materials[0].ReflectionCoef = 0.5;
	materials[0].RefractionCoef = 1.3;
	if (SmallSphere == vec3(0.0, 0.0, 1.0))
		materials[0].MaterialType = REFRACTION;
	else if (SmallSphere == vec3(1.0, 0.0, 0.0))
		materials[0].MaterialType = DIFFUSE_REFLECTION;
	else 
		materials[0].MaterialType = MIRROR_REFLECTION;
	
	//"общая коробка"
	materials[1].Color = vec3(0.9, 0.9, 0.15);	//левая грань
	materials[1].LightCoeffs = vec4(lightCoefs);
	materials[1].ReflectionCoef = 0.5;
	materials[1].RefractionCoef = 1.0;
	materials[1].MaterialType = DIFFUSE_REFLECTION;	
	
	materials[2].Color = vec3(0.0, 0.0, 0);	//задняя грань
	materials[2].LightCoeffs = vec4(lightCoefs);
	materials[2].ReflectionCoef = 0.5;
	materials[2].RefractionCoef = 1.0;
	materials[2].MaterialType = DIFFUSE_REFLECTION;

	materials[3].Color = vec3(1.0, 0,0);	//правая грань
	materials[3].LightCoeffs = vec4(lightCoefs);
	materials[3].ReflectionCoef = 0.5;
	materials[3].RefractionCoef = 1.0;
	materials[3].MaterialType = DIFFUSE_REFLECTION;

	materials[4].Color = vec3(0, 1.0, 0);	//нижняя грань
	materials[4].LightCoeffs = vec4(lightCoefs);
	materials[4].ReflectionCoef = 0.5;
	materials[4].RefractionCoef = 1.0;
	materials[4].MaterialType = DIFFUSE_REFLECTION;

	materials[5].Color = vec3(0, 0, 1.0);	//верхняя грань
	materials[5].LightCoeffs = vec4(lightCoefs);
	materials[5].ReflectionCoef = 0.5;
	materials[5].RefractionCoef = 1.0;
	materials[5].MaterialType = DIFFUSE_REFLECTION;	

	materials[8].Color = ColCub1;						//материал для куба 1
	materials[8].LightCoeffs = vec4(lightCoefs);
	materials[8].ReflectionCoef = 0.5;
	materials[8].RefractionCoef = 1.3;
	if (Cub == vec3(0.0, 0.0, 1.0))
		materials[8].MaterialType = REFRACTION;
	else if (Cub == vec3(1.0, 0.0, 0.0))
		materials[8].MaterialType = DIFFUSE_REFLECTION;
	else 
		materials[8].MaterialType = MIRROR_REFLECTION;

	materials[9].Color = ColCub2;						//материал для куба 2
	materials[9].LightCoeffs = vec4(lightCoefs);
	materials[9].ReflectionCoef = 0.5;
	materials[9].RefractionCoef = 1.3;	
	if (Cub == vec3(0.0, 0.0, 1.0))
		materials[9].MaterialType = REFRACTION;
	else if (Cub == vec3(1.0, 0.0, 0.0))
		materials[9].MaterialType = DIFFUSE_REFLECTION;
	else 
		materials[9].MaterialType = MIRROR_REFLECTION;

	materials[10].Color = ColCub3;						//материал для куба 3
	materials[10].LightCoeffs = vec4(lightCoefs);
	materials[10].ReflectionCoef = 0.5;
	materials[10].RefractionCoef = 1.3;
	if (Cub == vec3(0.0, 0.0, 1.0))
		materials[10].MaterialType = REFRACTION;
	else if (Cub == vec3(1.0, 0.0, 0.0))
		materials[10].MaterialType = DIFFUSE_REFLECTION;
	else 
		materials[10].MaterialType = MIRROR_REFLECTION;

	materials[7].Color = ColBigSphere;					//материал для большого шарика
	materials[7].LightCoeffs = vec4(lightCoefs);
	materials[7].ReflectionCoef = 0.5;
	materials[7].RefractionCoef = 1.3;
	if (BigSphere == vec3(0.0, 0.0, 1.0))
		materials[7].MaterialType = REFRACTION;
	else if (BigSphere == vec3(1.0, 0.0, 0.0))
		materials[7].MaterialType = DIFFUSE_REFLECTION;
	else 
		materials[7].MaterialType = MIRROR_REFLECTION;

	materials[11].Color = ColTet1;						//материал для тетраэдра 1
	materials[11].LightCoeffs = vec4(lightCoefs);
	materials[11].ReflectionCoef = 0.5;
	materials[11].RefractionCoef = 1.6;
	if (Tet == vec3(0.0, 0.0, 1.0))
		materials[11].MaterialType = REFRACTION;
	else if (Tet == vec3(1.0, 0.0, 0.0))
		materials[11].MaterialType = REFRACTION;
	else 
		materials[11].MaterialType = REFRACTION;

		materials[12].Color = ColTet2;					//материал для тетраэдра 2
	materials[12].LightCoeffs = vec4(lightCoefs);
	materials[12].ReflectionCoef = 0.5;
	materials[12].RefractionCoef = 1.6;
	if (Tet == vec3(0.0, 0.0, 1.0))
		materials[12].MaterialType = REFRACTION;
	else if (Tet == vec3(1.0, 0.0, 0.0))
		materials[12].MaterialType = REFRACTION;
	else 
		materials[12].MaterialType = REFRACTION;
}

void initializeDefaultScene()
{
	/** TRIANGLES **/
	/* left wall */
	triangles[0].v1 = vec3(-5.0,-5.0,-5.0);
	triangles[0].v2 = vec3(-5.0, 5.0, 5.0);		
	triangles[0].v3 = vec3(-5.0, 5.0,-5.0);
	triangles[0].MaterialIdx = 0;
	triangles[1].v1 = vec3(-5.0,-5.0,-5.0);
	triangles[1].v2 = vec3(-5.0,-5.0, 5.0);		
	triangles[1].v3 = vec3(-5.0, 5.0, 5.0);		
	triangles[1].MaterialIdx = 0;
	/* back wall */
	triangles[2].v1 = vec3(-5.0,-5.0, 5.0);		
	triangles[2].v2 = vec3( 5.0,-5.0, 5.0);
	triangles[2].v3 = vec3(-5.0, 5.0, 5.0);		
	triangles[2].MaterialIdx = 0;
	triangles[3].v1 = vec3( 5.0, 5.0, 5.0);		
	triangles[3].v2 = vec3(-5.0, 5.0, 5.0);
	triangles[3].v3 = vec3( 5.0,-5.0, 5.0);
	triangles[3].MaterialIdx = 0;
	/*right wall */ 
	triangles[4].v1 = vec3(5.0, 5.0, 5.0);
	triangles[4].v2 = vec3(5.0, -5.0, 5.0); 
	triangles[4].v3 = vec3(5.0, 5.0, -5.0); 
	triangles[4].MaterialIdx = 0; 
	triangles[5].v1 = vec3(5.0, 5.0, -5.0); 
	triangles[5].v2 = vec3(5.0, -5.0, 5.0); 
	triangles[5].v3 = vec3(5.0, -5.0, -5.0); 
	triangles[5].MaterialIdx = 0; 
	/*down wall */ 
	triangles[6].v1 = vec3(-5.0,-5.0, 5.0);		
	triangles[6].v2 = vec3(-5.0,-5.0,-5.0); 
	triangles[6].v3 = vec3( 5.0,-5.0, 5.0); 
	triangles[6].MaterialIdx = 0; 
	triangles[7].v1 = vec3(5.0, -5.0, -5.0); 
	triangles[7].v2 = vec3(5.0,-5.0, 5.0); 
	triangles[7].v3 = vec3(-5.0,-5.0,-5.0); 
	triangles[7].MaterialIdx = 0; 
	/*up wall */ 
	triangles[8].v1 = vec3(-5.0, 5.0,-5.0); 
	triangles[8].v2 = vec3(-5.0, 5.0, 5.0);		
	triangles[8].v3 = vec3( 5.0, 5.0, 5.0); 
	triangles[8].MaterialIdx = 0; 
	triangles[9].v1 = vec3(-5.0, 5.0, -5.0); 
	triangles[9].v2 = vec3( 5.0, 5.0, 5.0); 
	triangles[9].v3 = vec3(5.0, 5.0, -5.0); 
	triangles[9].MaterialIdx = 0; 	
	if (BigSphere != vec3(0.0, 0.0, 0.0))			//если большая сфера не отключена
	{
		spheres[0].Center = vec3(-1.0,-2.0,-2.0);
		spheres[0].Radius = 2.0;
		spheres[0].MaterialIdx = 0;
	}
	if (SmallSphere != vec3(0.0, 0.0, 0.0))			//если маленькая сфера не отключена
	{
		spheres[1].Center = vec3(2.0,1.0,2.0);
		spheres[1].Radius = 1.0;
		spheres[1].MaterialIdx = 0;
	}

	/** Kubs **/
	kubs[0].v1 = vec3(-1.5,-1.5,-1.0);	//a (вершины)
	kubs[0].v2 = vec3(-1.0, 1.0, 1.0);	//h
	kubs[0].v3 = vec3(-1.5, 0.5,-1.0);	//e
	kubs[0].MaterialIdx = 0;
	kubs[1].v1 = vec3(-1.5,-1.5,-1.0);	//a
	kubs[1].v2 = vec3(-1.0,-1.0, 1.0);	//c
	kubs[1].v3 = vec3(-1.0, 1.0, 1.0);	//h						
	kubs[1].MaterialIdx = 0;
	/* back wall */
	kubs[2].v1 = vec3(-1.0,-1.0, 1.0);	//c
	kubs[2].v2 = vec3( 1.0,-1.0, 1.0);	//d
	kubs[2].v3 = vec3(-1.0, 1.0, 1.0);	//h
	kubs[2].MaterialIdx = 0;
	kubs[3].v1 = vec3( 1.0, 1.0, 1.0);	//g
	kubs[3].v2 = vec3(-1.0, 1.0, 1.0);	//h
	kubs[3].v3 = vec3( 1.0,-1.0, 1.0);	//d
	kubs[3].MaterialIdx = 0;
	/*right wall */ 
	kubs[4].v1 = vec3(1.0, 1.0, 1.0);	//g
	kubs[4].v2 = vec3(1.0, -1.0, 1.0);	//d
	kubs[4].v3 = vec3(0.5, 0.5, -1.0);	//f
	kubs[4].MaterialIdx = 0; 
	kubs[5].v1 = vec3(0.5, 0.5, -1.0);	//f
	kubs[5].v2 = vec3(1.0, -1.0, 1.0);	//d
	kubs[5].v3 = vec3(0.5, -1.5, -1.0); //b
	kubs[5].MaterialIdx = 0; 
	/*down wall */ 
	kubs[6].v1 = vec3(-1.0,-1.0, 1.0); //c
	kubs[6].v2 = vec3(-1.5,-1.5,-1.0); //a
	kubs[6].v3 = vec3( 1.0,-1.0, 1.0); //d
	kubs[6].MaterialIdx = 0; 
	kubs[7].v1 = vec3(0.5, -1.5, -1.0); //b
	kubs[7].v2 = vec3(1.0,-1.0, 1.0);	//d
	kubs[7].v3 = vec3(-1.5,-1.5,-1.0);	//a
	kubs[7].MaterialIdx = 0; 
	/*up wall */ 
	kubs[8].v1 = vec3(-1.5, 0.5,-1.0); //e
	kubs[8].v2 = vec3(-1.0, 1.0, 1.0); //h
	kubs[8].v3 = vec3( 1.0, 1.0, 1.0); //g
	kubs[8].MaterialIdx = 0; 
	kubs[9].v1 = vec3(-1.5, 0.5, -1.0); //e
	kubs[9].v2 = vec3( 1.0, 1.0, 1.0);	//g
	kubs[9].v3 = vec3(0.5, 0.5, -1.0);	//f
	kubs[9].MaterialIdx = 0; 

	kubs[10].v1 = vec3(-1.5,-1.5, -1.0); //a
	kubs[10].v2 = vec3( 0.5,-1.5, -1.0); //b
	kubs[10].v3 = vec3(-1.5, 0.5, -1.0); //e
	kubs[10].MaterialIdx = 0; 
	kubs[11].v1 = vec3( 0.5, 0.5, -1.0); //f
	kubs[11].v2 = vec3(-1.5, 0.5, -1.0); //e
	kubs[11].v3 = vec3( 0.5,-1.5, -1.0); //b
	kubs[11].MaterialIdx = 0;
	

	/** Thetr **/
	
	thetrs[0].v1 = vec3(0.0,-1.0, -3.5); //c
	thetrs[0].v2 = vec3( 1.5,-1.5, -5.0); //b
	thetrs[0].v3 = vec3(3.0,-1.0, -3.5); //d
	thetrs[0].MaterialIdx = 0;
	thetrs[1].v1 = vec3(0.0,-1.0, -3.5); //c
	thetrs[1].v2 = vec3( 1.5,-1.5, -5.0); //b
	thetrs[1].v3 = vec3( 1.3, 0.5, -5.0); //f
	thetrs[1].MaterialIdx = 0;
	
	thetrs[2].v1 = vec3( 1.5,-1.5, -5.0); //b
	thetrs[2].v2 = vec3(3.0,-1.0, -3.5); //d
	thetrs[2].v3 = vec3( 1.3, 0.5, -5.0); //f
	thetrs[2].MaterialIdx = 0;
	thetrs[3].v1 = vec3(0.0,-1.0, -3.5); //c
	thetrs[3].v2 = vec3(3.0,-1.0, -3.5); //d
	thetrs[3].v3 = vec3( 1.3, 0.5, -5.0); //f
	thetrs[3].MaterialIdx = 0;
	

}

bool IntersectSphere ( SSphere sphere, SRay ray, float start, float final, out float time )
{
	ray.Origin -= sphere.Center;
	float A = dot ( ray.Direction, ray.Direction );
	float B = dot ( ray.Direction, ray.Origin );
	float C = dot ( ray.Origin, ray.Origin ) - sphere.Radius * sphere.Radius;
	float D = B * B - A * C;
	if ( D > 0.0 )
	{
		D = sqrt ( D );
		//time = min ( max ( 0.0, ( -B - D ) / A ), ( -B + D ) / A );
		float t1 = ( -B - D ) / A;
		float t2 = ( -B + D ) / A;
		if(t1 < 0 && t2 < 0)
		return false;
	if(min(t1, t2) < 0)
	{
		time = max(t1,t2);
		return true;
	}
		time = min(t1, t2);
		return true;
	}
	return false;
}

bool IntersectTriangle (SRay ray, vec3 v1, vec3 v2, vec3 v3, out float time )
{
	// // Compute the intersection of ray with a triangle using geometric solution
	// Input: // points v0, v1, v2 are the triangle's vertices
	// rayOrig and rayDir are the ray's origin (point) and the ray's direction
	// Return: // return true is the ray intersects the triangle, false otherwise
	// bool intersectTriangle(point v0, point v1, point v2, point rayOrig, vector rayDir){
	// compute plane's normal vector
	time = -1;
	vec3 A = v2 - v1;
	vec3 B = v3 - v1;
	// no need to normalize vector
	vec3 N = cross(A, B);
	// N
	// // Step 1: finding P
	// // check if ray and plane are parallel ?
	float NdotRayDirection = dot(N, ray.Direction);
	if (abs(NdotRayDirection) < 0.001)
		return false;
	// they are parallel so they don't intersect !
	// compute d parameter using equation 2
	float d = dot(N, v1);
	// compute t (equation 3)
	float t = -(dot(N, ray.Origin) - d) / NdotRayDirection;
	// check if the triangle is in behind the ray
	if (t < 0)
		return false;
	// the triangle is behind
	// compute the intersection point using equation 1
	vec3 P = ray.Origin + t * ray.Direction;
	// // Step 2: inside-outside test //
	vec3 C;
	// vector perpendicular to triangle's plane
	// edge 0
	vec3 edge1 = v2 - v1;
	vec3 VP1 = P - v1;
	C = cross(edge1, VP1);
	if (dot(N, C) < 0)
		return false;
	// P is on the right side
	// edge 1
	vec3 edge2 = v3 - v2;
	vec3 VP2 = P - v2;
	C = cross(edge2, VP2);
	if (dot(N, C) < 0)
		return false;
	// P is on the right side
	// edge 2
	vec3 edge3 = v1 - v3;
	vec3 VP3 = P - v3;
	C = cross(edge3, VP3);
	if (dot(N, C) < 0)
		return false;
	// P is on the right side;
	time = t;
		return true;
	// this ray hits the triangle
}

bool Raytrace ( SRay ray, float start, float final, inout SIntersection intersect )
{
	bool result = false;
	float test = start;
	intersect.Time = final;
	//calculate intersect with spheres
	for(int i = 0; i < 2; i++)
	{
		SSphere sphere = spheres[i];
		if( IntersectSphere (sphere, ray, start, final, test ) && test < intersect.Time )
		{
			int numMat = spheres[i].MaterialIdx;
			intersect.Time = test;
			intersect.Point = ray.Origin + ray.Direction * test;
			intersect.Normal = normalize(intersect.Point - spheres[i].Center);
			if ((i == 1) && (SmallSphere != vec3(0.0, 0.0, 0.0)))		//маленький шарик
			{
				intersect.Color = materials[0].Color;
				intersect.LightCoeffs = materials[0].LightCoeffs;
				intersect.ReflectionCoef = materials[0].ReflectionCoef;
				intersect.RefractionCoef = materials[0].RefractionCoef;
				intersect.MaterialType = materials[0].MaterialType;
			}
			if ((i == 0) && (BigSphere != vec3(0.0, 0.0, 0.0)))		//большой шарик
			{
				intersect.Color = materials[7].Color;
				intersect.LightCoeffs = materials[7].LightCoeffs;
				intersect.ReflectionCoef = materials[7].ReflectionCoef;
				intersect.RefractionCoef = materials[7].RefractionCoef;
				intersect.MaterialType = materials[7].MaterialType;
			}
			result = true;
		}
	}
	//calculate intersect with triangles
	for(int i = 0; i < 10; i++)
	{
		STriangle triangle = triangles[i];
		if(IntersectTriangle(ray, triangle.v1, triangle.v2, triangle.v3, test)
			&& test < intersect.Time)
		{
			int numMat = triangles[i].MaterialIdx;
			intersect.Time = test;
			intersect.Point = ray.Origin + ray.Direction * test;
			intersect.Normal = normalize(cross(triangle.v1 - triangle.v2, triangle.v3 - triangle.v2));
			intersect.Color = materials[i /2 + 1].Color;
			intersect.LightCoeffs = materials[i /2 + 1].LightCoeffs;
			intersect.ReflectionCoef = materials[i /2 + 1].ReflectionCoef;
			intersect.RefractionCoef = materials[i /2 + 1].RefractionCoef;
			intersect.MaterialType = materials[i /2 + 1].MaterialType;
			result = true;
		}
	}
	//calculate intersect with kubs
	for(int i = 0; i < 12; i++)
	{
		SKub kub = kubs[i];
		if(IntersectTriangle(ray, kub.v1, kub.v2, kub.v3, test)
			&& test < intersect.Time && (Cub != vec3(0.0, 0.0, 0.0)))
		{			
			int numMat;
			if ((i == 4) || (i == 5)) numMat = 8;
			else if ((i == 8) || (i == 9)) numMat = 9;
			else numMat = 10;
			intersect.Time = test;
			intersect.Point = ray.Origin + ray.Direction * test;
			intersect.Normal = normalize(cross(kub.v1 - kub.v2, kub.v3 - kub.v2));
			intersect.Color = materials[numMat].Color;
			intersect.LightCoeffs = materials[numMat].LightCoeffs;
			intersect.ReflectionCoef = materials[numMat].ReflectionCoef;
			intersect.RefractionCoef = materials[numMat].RefractionCoef;
			intersect.MaterialType = materials[numMat].MaterialType;
			result = true;
		}
	}

	//calculate intersect with thetrs
	for(int i = 0; i < 3; i++)
	{
		SThetr thetr = thetrs[i];
		if(IntersectTriangle(ray, thetr.v1, thetr.v2, thetr.v3, test)
			&& test < intersect.Time && (Tet != vec3(0.0, 0.0, 0.0)))
		{
			int numMat;
			if (i % 2 == 0) numMat = 11;			
				else numMat = 12;
			intersect.Time = test;
			intersect.Point = ray.Origin + ray.Direction * test;
			intersect.Normal = normalize(cross(thetr.v1 - thetr.v2, thetr.v3 - thetr.v2));
			intersect.Color = materials[numMat].Color;
			intersect.LightCoeffs = materials[numMat].LightCoeffs;
			intersect.ReflectionCoef = materials[numMat].ReflectionCoef;
			intersect.RefractionCoef = materials[numMat].RefractionCoef;
			intersect.MaterialType = materials[numMat].MaterialType;
			result = true;
		}
	}

	return result;
}

float Shadow(SLight currLight, SIntersection intersect)
{
	// Point is lighted
	float shadowing = 1.0;
	// Vector to the light source
	vec3 direction = normalize(currLight.Position - intersect.Point);
	// Distance to the light source
	float distanceLight = distance(currLight.Position, intersect.Point);
	// Generation shadow ray for this light source
	SRay shadowRay = SRay(intersect.Point + direction * 0.001, direction);
	// ...test intersection this ray with each scene object
	SIntersection shadowIntersect;
	shadowIntersect.Time = 1000000.0;
	// trace ray from shadow ray begining to light source position
	if(Raytrace(shadowRay, 0, distanceLight, shadowIntersect))
	{
		// this light source is invisible in the intercection point
		shadowing = 0.0;
	}
	return shadowing;
}

vec3 Phong ( SIntersection intersect, SLight currLight, SCamera uCamera)
{
	float Unit = 1;
	float shadow = Shadow(currLight, intersect);
	vec3 light = normalize ( currLight.Position - intersect.Point );
	float diffuse = max(dot(light, intersect.Normal), 0.0);
	vec3 view = normalize(uCamera.Position - intersect.Point);
	vec3 reflected= reflect( -view, intersect.Normal );
	float specular = pow(max(dot(reflected, light), 0.0), intersect.LightCoeffs.w);
	return intersect.LightCoeffs.x * intersect.Color +
		intersect.LightCoeffs.y * diffuse * intersect.Color * shadow +
		intersect.LightCoeffs.z * specular * Unit;
}

			/*** СТЕК ****/
struct Stack
{	
	int count;
	STracingRay ar[100];
};

Stack st;

bool isEmpty()
{
	return (st.count <= 0);
}

void push(STracingRay ray)
{
	st.ar[st.count] = ray;
	st.count++;
}

STracingRay pop()
{
	st.count--;
	return st.ar[st.count];
}

void main( void )
{
	st.count = 0 ;

	float start, final;
	SCamera uCamera = initializeDefaultCamera();
	SRay ray = GenerateRay(uCamera);
	vec3 resultColor = vec3(0,0,0);
	initializeDefaultScene();
	initializeDefaultLightMaterials(ulight);
	STracingRay trRay = STracingRay(ray, 1, 0);
	push(trRay);

	while(!isEmpty())
	{			
		STracingRay trRay = pop();
		ray = trRay.ray;
		SIntersection intersect;
		intersect.Time = 1000000.0;
		start = 0;
		final = 1000000.0;
		if (Raytrace(ray, start, final, intersect))
		{
			switch(intersect.MaterialType)
			{
				case DIFFUSE_REFLECTION:
				{
					float shadowing = Shadow(ulight, intersect);
					resultColor += trRay.contribution * Phong ( intersect, ulight, uCamera );
					break;
				}
				case MIRROR_REFLECTION:
				{
					if(intersect.ReflectionCoef < 1)
					{
						float contribution = trRay.contribution * (1 - intersect.ReflectionCoef);
						float shadowing = Shadow(ulight, intersect);												 
						resultColor += contribution * Phong(intersect, ulight, uCamera);
					}
					vec3 reflectDirection = reflect(ray.Direction, intersect.Normal);
					// creare reflection ray
					float contribution = trRay.contribution * intersect.ReflectionCoef;
					STracingRay reflectRay = STracingRay(
					SRay(intersect.Point + reflectDirection * 0.001, reflectDirection),contribution, trRay.depth + 1);
					if (reflectRay.depth <= 1) {
						push(reflectRay);
					}
					break;
				}
				case REFRACTION:
				{
					float ior;
					int sign;
					if (dot(ray.Direction, intersect.Normal) < 0) ior = 1.0 / intersect.RefractionCoef;
						 else ior = intersect.RefractionCoef;
					if (dot(ray.Direction, intersect.Normal) < 0) sign = 1;
						else sign = -1;                     
					vec3 refractionDirection = normalize(refract(ray.Direction,  intersect.Normal * sign, ior));
					vec3 refractionRayOrig = intersect.Point + EPSILON * refractionDirection;
					STracingRay refractRay = STracingRay(SRay(refractionRayOrig, refractionDirection), trRay.contribution, trRay.depth + 1);
					
					if (refractRay.depth <= 6) {
						push(refractRay);
					}
				}
			} 
		}
	} 

	FragColor = vec4 ( resultColor, 1.0 );
}